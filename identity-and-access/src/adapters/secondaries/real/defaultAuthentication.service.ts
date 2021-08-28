import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { perform } from '@common/utils/perform';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { Email } from '@identity-and-access/domain/value-objects/email';
import { HashedPassword, PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isRight } from 'fp-ts/lib/Either';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

const saltOrRounds = 10;

@Injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  constructor(private readonly userRepository: UserRepository, private logger: PinoLoggerService) {
    this.logger.setContext('AuthenticationService');
  }

  assertEmailUnicity = (email: Email): TaskEither<Error, void> =>
    tryCatch(
      async () => {
        const existingUser = await perform(email, this.userRepository.getByEmail, this.logger, 'get user by email')();
        if (isRight(existingUser) && User.guard(existingUser.right)) throw new ConflictException('User with email already exists');
      },
      (error: Error) => error,
    );

  hashPlainPassword = (plainPassword: PlainPassword): TaskEither<Error, HashedPassword> => {
    return tryCatch(
      async () => {
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return HashedPassword.check(hash);
      },
      (error: Error) => error,
    );
  };
}
