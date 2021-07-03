import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { User } from '@modules/identity-and-access/domain/models/user';
import { UserRepository } from '@modules/identity-and-access/domain/repositories/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        const existingUser = this.users.find((c) => c.email == user.email);
        if (existingUser == undefined) this.users.push(user);
        else throw new Error('Email already exists.');
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
