import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { User } from '@identity-and-access/domain/entities/user';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { AccessToken } from '@identity-and-access/domain/value-objects/accessToken';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';
import { RefreshToken } from '@identity-and-access/domain/value-objects/refreshToken';
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
  createAuthenticationTokens = (user: User): TaskEither<Error, [AccessToken, RefreshToken]> => {
    return tryCatch(
      async () => {
        const payload = { id: user.id };
        return [AccessToken.check(this.jwtService.sign(payload, {secret: jwtConstants.access_token_secret})), RefreshToken.check(this.jwtService.sign(payload, {secret: jwtConstants.refresh_token_secret}))];
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

  extractTokenFromAuthorizationHeader = (authorizationHeader: string) => {
    const bearerScheme = /^Bearer (?<token>[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/;
    const bearerMatch = authorizationHeader?.match(bearerScheme);
    if (bearerMatch === null || bearerMatch.groups === undefined) {
      this.logger.warn('Bearer not matching: returning 401');
      return left(new UnauthorizedException('Unknown scheme'));
    }
    return right(bearerMatch.groups.token);
  };
  
  verifyIntegrityAndAuthenticityOfToken = (token: string) => {
    return pipe(
      token,
      (token) => this.verify(token),
      mapLeft(() => {
        this.logger.warn('Authentication service did not verify token: returning 401');
        return new UnauthorizedException('Invalid token');
      }),
      map(() => {
        return right(null);
      }),
    );
  };

  verify(bearerToken: string): TaskEither<Error, void> {
    return pipe(
      tryCatch(
        async () => await this.jwtService.verify(bearerToken, {secret: jwtConstants.access_token_secret}),
        (error) => new Error(`Verification failed: ${error}`),
      ),
      map((decodedToken) => {
        this.logger.debug(`Verification succeed: ${JSON.stringify(decodedToken)}`);
        return;
      }),
    );
  }
}
