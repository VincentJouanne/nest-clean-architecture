import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '../value-objects/email';
import { HashedPassword, PlainPassword } from '../value-objects/password';

export interface AuthenticationService {
  assertEmailUnicity: (email: Email) => TaskEither<Error, void>;
  hashPlainPassword: (password: PlainPassword) => TaskEither<Error, HashedPassword>;
}
