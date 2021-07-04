import { CoreLogger } from '@common/logger/adapters/pinoLogger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@common/utils/executeTask';
import { perform } from '@common/utils/perform';
import { User } from '@identity-and-access/domain/models/user';
import { fromUnknown } from '@common/utils/fromUnknown';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/passwordHashing.service';
import { PlainPassword } from '@identity-and-access/domain/models/password';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '@identity-and-access/domain/models/email';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/uuidGenerator.service';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/inMemoryUser.repository';
import { InMemoryTagGeneratorService } from '@identity-and-access/adapters/secondaries/inMemoryTagGenerator.service';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly tagGeneratorService: InMemoryTagGeneratorService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly userRepository: InMemoryUserRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('SignUp');
  }

  execute(command: SignUp): Promise<void> {
    const task = pipe(
      right(command),
      //Validation
      chain((command) =>
        sequenceS(taskEither)({
          email: fromUnknown(command.email, Email, this.logger, 'email'),
          plainPassword: fromUnknown(command.password, PlainPassword, this.logger, 'plain password'),
        }),
      ),
      //Encryption
      chain((validatedParam) =>
        sequenceT(taskEither)(
          perform(validatedParam.plainPassword, this.passwordHashingService.hash, this.logger, 'plain password hashed'),
          right(validatedParam.email),
        ),
      ),
      //Formatting
      chain(([hashedPassword, validatedEmail]) =>
        fromUnknown(
          {
            id: this.uuidGeneratorService.generateUUID(),
            tag: this.tagGeneratorService.generateTag6(),
            email: validatedEmail,
            password: hashedPassword,
          },
          User,
          this.logger,
          'user',
        ),
      ),
      //Storage
      chain((user) => perform(user, this.userRepository.save, this.logger, 'save user in storage system.')),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => {};
