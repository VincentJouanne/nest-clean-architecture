import { TaskEither } from 'fp-ts/lib/TaskEither';
import { User } from '../entities/user';
import { AccessToken } from '../value-objects/accessToken';
import { RefreshToken } from '../value-objects/refreshToken';

export abstract class AuthenticationService {
  createAuthenticationTokens!: (user: User) => TaskEither<Error, [AccessToken, RefreshToken]>;
}
