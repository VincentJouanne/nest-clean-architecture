import { TaskEither } from 'fp-ts/lib/TaskEither';
import { User } from '@modules/identity-and-access/domain/models/user';

export interface UserRepository {
  save: (user: User) => TaskEither<Error, void>;
}
