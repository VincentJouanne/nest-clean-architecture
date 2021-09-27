import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UserId } from '../../domain/entities/user';
import { AccessToken } from '../../domain/value-objects/accessToken';
import { RefreshToken } from '../../domain/value-objects/refreshToken';

export abstract class AuthenticationService {
  createAuthenticationTokens!: (userId: UserId) => TaskEither<Error, [AccessToken, RefreshToken]>;
}
