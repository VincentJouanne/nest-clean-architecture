import { Email } from '@common/mail/domain/value-objects/email';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class FakeUserRepository implements UserRepository {
  private users: User[] = [];
  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const existingUser = this.users.find((u) => u.email == email);
        if (existingUser == undefined) return null;
        else return existingUser;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.users.push(user);
      },
      (reason: unknown) => new InternalServerErrorException())
  };

  all = (): TaskEither<Error, User[]> => {
    return tryCatch(
      async () => {
        return this.users;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
