import { executeTask } from '@common/utils/executeTask';
import { User, UserId } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/infrastructure/ports/user.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Email } from '@notifications/domain/value-objects/email';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class FakeUserRepository implements UserRepository {
  private users: User[] = [];

  getById = (userId: UserId): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const existingUser = this.users.find((u) => u.id == userId);
        if (existingUser == undefined) return null;
        else return existingUser;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const existingUser = this.users.find((u) => u.contactInformation.email == email);
        if (existingUser == undefined) return null;
        else return existingUser;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        const existingUser = await executeTask(this.getById(user.id))
        if (existingUser != null) {
          const index = this.users.findIndex(userInStorage => userInStorage.id == user.id)
          this.users.splice(index, 1)
        }
        this.users.push(user);
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
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
