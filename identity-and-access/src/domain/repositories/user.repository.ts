import { Email } from '@common/mail/domain/value-objects/email';
import { User } from '@identity-and-access/domain/entities/user';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UUID } from '../value-objects/uuid';

export abstract class UserRepository {
  getById!: (userId: UUID) => TaskEither<Error, User | null>;
  getByEmail!: (email: Email) => TaskEither<Error, User | null>;
  save!: (user: User) => TaskEither<Error, void>;
}
