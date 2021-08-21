import { BasicLoggerService } from '@common/logger/adapters/basicLogger.service';
import { perform } from '@common/utils/perform';
import { User } from '@identity-and-access/domain/entities/user';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { Email } from '@identity-and-access/domain/value-objects/email';
import { ConflictException, Injectable } from '@nestjs/common';
import { isRight } from 'fp-ts/lib/Either';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { InMemoryUserRepository } from '../in-memory/inMemoryUser.repository';

@Injectable()
export class RealAuthenticationService implements AuthenticationService {
  constructor(private userRepository: InMemoryUserRepository, private logger: BasicLoggerService) {
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
}
