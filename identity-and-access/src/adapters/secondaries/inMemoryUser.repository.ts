import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { ConflictException, Injectable } from '@nestjs/common';
import { Email } from '@identity-and-access/domain/value-objects/email';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  getByEmail = (email: Email): TaskEither<null, User> => {
    return tryCatch(
      async () => {
        return this.users.find((u) => u.email == email);
      },
      () => null,
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.users.push(user);
      },
      (error: Error) => error,
    );
  };

  all = (): TaskEither<Error, User[]> => {
    return tryCatch(
      async () => {
        return this.users;
      },
      (error: Error) => error,
    );
  };
}
