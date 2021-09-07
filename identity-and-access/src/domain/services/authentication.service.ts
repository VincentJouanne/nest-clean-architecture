import { TaskEither } from 'fp-ts/lib/TaskEither';
import { User } from '../entities/user';
import { JWT } from '../value-objects/jwt';

export abstract class AuthenticationService {
  createJWT!: (user: User) => TaskEither<Error, JWT>;
}
