import { TaskEither } from 'fp-ts/lib/TaskEither';
import { HashedPassword, PlainPassword } from '../value-objects/password';

export interface AuthenticationService {
  hashPlainPassword: (password: PlainPassword) => TaskEither<Error, HashedPassword>;
}
