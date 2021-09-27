import { User, UserId } from '@identity-and-access/domain/entities/user';
import { Email } from '@notifications/domain/value-objects/email';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export abstract class UserRepository {
  getById!: (userId: UserId) => TaskEither<Error, User | null>;
  getByEmail!: (email: Email) => TaskEither<Error, User | null>;
  save!: (user: User) => TaskEither<Error, void>;
}
