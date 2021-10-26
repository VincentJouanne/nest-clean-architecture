import { User } from 'call-identification/src/domain/entities/user';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export abstract class UserRepository {
  getByPhoneNumber!: (userId: string) => TaskEither<Error, User | null>;
}
