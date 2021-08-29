import { Email } from '@common/mail/domain/value-objects/email';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class RealUserRepository implements UserRepository {
  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        //TODO: Add real implementation
        return null;
      },
      (error: Error) => error,
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        //TODO: Add real implementation
        return;
      },
      (error: Error) => error,
    );
  };

  all = (): TaskEither<Error, User[]> => {
    return tryCatch(
      async () => {
        return [];
      },
      (error: Error) => error,
    );
  };
}
