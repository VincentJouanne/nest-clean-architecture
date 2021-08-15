import { CoreLogger } from '@common/logger/adapters/pinoLogger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@common/utils/executeTask';
import { perform } from '@common/utils/perform';
import { User } from '@identity-and-access/domain/entities/user';
import { fromUnknown } from '@common/utils/fromUnknown';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/passwordHashing.service';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '@identity-and-access/domain/value-objects/email';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/uuidGenerator.service';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/inMemoryUser.repository';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { UnverifiedEmail } from '@identity-and-access/domain/value-objects/emailInfos';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly userRepository: InMemoryUserRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('SignUp');
  }

  execute(command: SignUp): Promise<void> {
    const task = pipe(
      right(command),
      //Data validation
      chain((command) =>
        sequenceS(taskEither)({
          id: fromUnknown(this.uuidGeneratorService.generateUUID(), UUID, this.logger, 'uuid'),
          email: fromUnknown(command.email, UnverifiedEmail, this.logger, 'email'),
          plainPassword: fromUnknown(command.password, PlainPassword, this.logger, 'plain password'),
        }),
      ),
      //Password hashing
      chain((validatedDatas) =>
        sequenceT(taskEither)(
          perform(validatedDatas.plainPassword, this.passwordHashingService.hash, this.logger, 'hash plain password'),
          right(validatedDatas),
        ),
      ),
      //Create domain entity
      chain(([hashedPassword, validatedDatas]) =>
        fromUnknown(
          {
            id: validatedDatas.id,
            email: validatedDatas.email,
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
