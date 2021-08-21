import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '../value-objects/email';

export interface AuthenticationService {
  assertEmailUnicity: (email: Email) => TaskEither<Error, void>;
}
