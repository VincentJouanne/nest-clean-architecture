import { CoreLogger } from '@common/logger/adapters/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { perform } from '@common/utils/perform';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/real/passwordHashing.service';
import { RealAuthenticationService } from '@identity-and-access/adapters/secondaries/real/realAuthentication.service';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/uuidGenerator.service';
import { User } from '@identity-and-access/domain/entities/user';
import { UnverifiedEmail } from '@identity-and-access/domain/value-objects/emailInfos';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { sequenceS } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import { chain, map, taskEither } from 'fp-ts/lib/TaskEither';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly authenticationService: RealAuthenticationService,
    private readonly userRepository: InMemoryUserRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('SignUp');
  }

  execute(command: SignUp): Promise<void> {
    const { email, password } = command;

    const task = pipe(
      //Data validation
      sequenceS(taskEither)({
        id: fromUnknown(this.uuidGeneratorService.generateUUID(), UUID, this.logger, 'uuid'),
        email: fromUnknown(email, UnverifiedEmail, this.logger, 'email'),
        plainPassword: fromUnknown(password, PlainPassword, this.logger, 'plain password'),
      }),
      chain((validatedDatas) =>
        pipe(
          perform(validatedDatas.email, this.authenticationService.assertEmailUnicity, this.logger, 'assert email unicity'),
          chain(() => perform(validatedDatas.plainPassword, this.passwordHashingService.hash, this.logger, 'hash plain password')),
          chain((hashedPassword) =>
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
