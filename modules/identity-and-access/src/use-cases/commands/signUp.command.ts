import { CoreLogger } from '@core/logger/adapters/pinoLogger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@shared/utils/executeTask';
import { UserRepository } from '@modules/identity-and-access/domain/repositories/user.repository';
import { perform } from '@shared/utils/perform';
import { User } from '@modules/identity-and-access/domain/user';
import { TagGeneratorService } from 'modules/identity-and-access/src/domain/services/tagGenerator.service';
import { fromUnknown } from '@shared/utils/fromUnknown';
import { PasswordHashingService } from '@modules/identity-and-access/adapters/passwordHashing.service';
import { PlainPassword } from '@modules/identity-and-access/domain/password';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '@modules/identity-and-access/domain/email';
import { UUIDGeneratorService } from '@modules/identity-and-access/adapters/uuidGenerator.service';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly tagGeneratorService: TagGeneratorService,
    private readonly encryptionService: PasswordHashingService,
    private readonly userRepository: UserRepository,
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
          perform(validatedParam.plainPassword, this.encryptionService.encrypt, this.logger, 'plain password encrypted'),
          right(validatedParam.email),
        ),
      ),
      //Formatting
      chain(([encryptedPassword, validatedEmail]) =>
        fromUnknown(
          {
            id: this.uuidGeneratorService.generateUUID(),
            tag: this.tagGeneratorService.generateTag6(),
            email: validatedEmail,
            password: encryptedPassword,
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
