import { TaskEither } from 'fp-ts/lib/TaskEither';
import { User } from '../user';

export interface UserRepository {
  save: (user: User) => TaskEither<Error, void>;
}
