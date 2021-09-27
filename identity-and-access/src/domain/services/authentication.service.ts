import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UserId } from '../entities/user';
import { AccessToken } from '../value-objects/accessToken';
import { RefreshToken } from '../value-objects/refreshToken';

export abstract class AuthenticationService {
  createAuthenticationTokens!: (userId: UserId) => TaskEither<Error, [AccessToken, RefreshToken]>;
}
