import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Email } from '@common/mail/domain/value-objects/email';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { noop } from '@common/utils/noop';
import { perform } from '@common/utils/perform';
import { DefaultHashingService } from '@identity-and-access/adapters/secondaries/real/defaultHashing.service';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import { chain, left, map, right, taskEither } from 'fp-ts/lib/TaskEither';

export class SignIn implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignIn)
export class SignInHandler implements ICommandHandler {
  constructor(
    private readonly hashingService: DefaultHashingService,
    private readonly userRepository: UserRepository,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext('SignIn');
  }

  execute(command: SignIn): Promise<void> {
    const { email, password } = command;
    let user: User;

    const task = pipe(
      sequenceS(taskEither)({
        email: fromUnknown(email, Email, this.logger, 'email'),
        plainPassword: fromUnknown(password, PlainPassword, this.logger, 'password'),
      }),
      chain((validatedDatas) =>
        sequenceT(taskEither)(perform(validatedDatas.email, this.userRepository.getByEmail, this.logger, 'get user by email'), right(validatedDatas)),
      ),
      //Assertions
      chain(([existingUser, validatedDatas]) => {
        if (existingUser == null) {
          return left(new NotFoundException('This user does not exist.'));
        } else if (!existingUser.isVerified) {
          return left(new ForbiddenException('This user has not verified its email address.'));
        }
        user = existingUser;
        return right({ plainPassword: validatedDatas.plainPassword, hashedPassword: existingUser.password });
      }),
      chain((passwords) =>
        perform(
          { plainPassword: passwords.plainPassword, hashedPassword: passwords.hashedPassword },
          this.hashingService.assertSameHashes,
          this.logger,
          'assert same hashes',
        ),
      ),
      chain((isCorrectPassword) => {
        if (isCorrectPassword) {
          return right(null);
        } else return left(new ForbiddenException('Password is incorrect'));
      }),
      //TODO: create and issue a JWT
      map(noop),
    );

    return executeTask(task);
  }
}
