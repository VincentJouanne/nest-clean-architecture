import { TaskEither } from 'fp-ts/lib/TaskEither';
import { User } from '@identity-and-access/domain/entities/user';
import { Email } from '../value-objects/email';

export interface UserRepository {
  getByEmail: (email: Email) => TaskEither<null, User>;
  save: (user: User) => TaskEither<Error, void>;
}
