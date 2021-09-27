import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { UserId } from '@identity-and-access/domain/entities/user';
import { InvalidTokenException } from '@identity-and-access/domain/exceptions/invalidToken.exception';
import { AccessToken } from '@identity-and-access/domain/value-objects/accessToken';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';
import { RefreshToken } from '@identity-and-access/domain/value-objects/refreshToken';
import { AuthenticationService } from '@identity-and-access/infrastructure/ports/authentication.service';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { left, map, mapLeft, right, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class RealAuthenticationService implements AuthenticationService {
  constructor(private logger: PinoLoggerService, private jwtService: JwtService) {
    this.logger.setContext('AuthenticationService');
  }
  createAuthenticationTokens = (userId: UserId): TaskEither<Error, [AccessToken, RefreshToken]> => {
    return tryCatch(
      async () => {
        const payload = { id: userId };
        return [AccessToken.check(this.jwtService.sign(payload, { secret: jwtConstants.access_token_secret, expiresIn: jwtConstants.access_token_expiry })), RefreshToken.check(this.jwtService.sign(payload, { secret: jwtConstants.refresh_token_secret, expiresIn: jwtConstants.refresh_token_expiry }))];
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  extractAuthorizationHeaderFromRequest = (request: Request) => {
    const authorizationHeader = request.headers['authorization'];
    this.logger.log(`Authorization Header is "${authorizationHeader}"`);
    if (!authorizationHeader) {
      this.logger.warn('No authorization header provided: returning 401');
      return left(new UnauthorizedException('Not logged in'));
    }
    return right(authorizationHeader);
  };

  extractBearerTokenFromAuthorizationHeader = (authorizationHeader: string) => {
    const bearerScheme = /^Bearer (?<token>[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/;
    const bearerMatch = authorizationHeader?.match(bearerScheme);
    if (bearerMatch === null || bearerMatch.groups === undefined) {
      this.logger.warn('Bearer not matching: returning 401');
      return left(new UnauthorizedException('Unknown scheme'));
    }
    return right(bearerMatch.groups.token);
  };

  verifyIntegrityAndAuthenticityOfAccessToken = (accessToken: string) => {
    return pipe(
      accessToken,
      (accessToken) => this.verifyAccessToken(accessToken),
      mapLeft(() => {
        this.logger.warn('Authentication service did not verify token: returning 401');
        return new UnauthorizedException('Invalid token');
      }),
      map(() => {
        return right(null);
      }),
    );
  };

  verifyIntegrityAndAuthenticityOfRefreshToken = (refreshToken: string) => {
    return pipe(
      refreshToken,
      (refreshToken) => this.verifyRefreshToken(refreshToken),
      mapLeft(() => {
        this.logger.warn('Token verification failed.');
        return new InvalidTokenException();
      }),
      map((decodedRefreshToken) => {
        return decodedRefreshToken;
      }),
    );
  };

  verifyAccessToken(accessToken: string): TaskEither<Error, void> {
    return pipe(
      tryCatch(
        async () => await this.jwtService.verify(accessToken, { secret: jwtConstants.access_token_secret }),
        (error) => new Error(`Verification failed: ${error}`),
      ),
      map((decodedToken) => {
        this.logger.debug(`Verification succeed: ${JSON.stringify(decodedToken)}`);
        return;
      }),
    );
  }

  verifyRefreshToken(refreshToken: string): TaskEither<Error, string> {
    return pipe(
      tryCatch(
        async () => await this.jwtService.verify(refreshToken, { secret: jwtConstants.refresh_token_secret }),
        (error) => new Error(`Verification failed: ${error}`),
      ),
      map((decodedRefreshToken) => {
        this.logger.debug(`Verification succeed: ${JSON.stringify(decodedRefreshToken)}`);
        //TODO [important, urgent] refactor this shit lol
        return (decodedRefreshToken as any)['id'] as string;
      }),
    );
  }
}
