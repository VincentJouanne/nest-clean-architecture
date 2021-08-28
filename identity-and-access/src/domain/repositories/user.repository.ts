import { User } from '@identity-and-access/domain/entities/user';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '../value-objects/email';

export abstract class UserRepository {
  getByEmail: (email: Email) => TaskEither<Error, User | null>;
  save: (user: User) => TaskEither<Error, void>;
  all: () => TaskEither<Error, User[]>;
}
