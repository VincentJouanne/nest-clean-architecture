import { User } from '@call-identification/domain/entities/user';
import { executeTask } from '@common/utils/executeTask';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from 'call-identification/src/infrastructure/ports/user.repository';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class FakeUserRepository implements UserRepository {
  private users: User[] = [
    User.check({
      id: '1',
      firstName: 'Vincent',
      lastName: 'JOUANNE',
      avatarUrl: '',
      phoneNumber: '+33607395612',
      company: 'BAM',
      notes: 'Vincent works at BAM.',
    }),
    User.check({
      id: '2',
      firstName: 'Patrick',
      lastName: 'Pfundstein',
      avatarUrl: '',
      phoneNumber: '+33607395613',
      company: 'ARDIAN',
      notes: 'Patrick works at ARDIAN.',
    }),
    User.check({
      id: '3',
      firstName: 'Vador',
      lastName: 'Dark',
      avatarUrl: '',
      phoneNumber: '+33607395614',
      company: 'Sith',
      notes: 'Vador works at Death Star.',
    }),
  ];

  getByPhoneNumber = (phoneNumber: string): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const existingUser = this.users.find((u) => u.phoneNumber == phoneNumber);
        if (existingUser == undefined) return null;
        else return existingUser;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        const existingUser = await executeTask(this.getByPhoneNumber(user.phoneNumber));
        if (existingUser != null) {
          const index = this.users.findIndex((userInStorage) => userInStorage.phoneNumber == user.phoneNumber);
          this.users.splice(index, 1);
        }
        this.users.push(user);
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
