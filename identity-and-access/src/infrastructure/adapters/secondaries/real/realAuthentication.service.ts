import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { User } from '@identity-and-access/domain/entities/user';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { JWT } from '@identity-and-access/domain/value-objects/jwt';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TaskEither, tryCatch, left, right, mapLeft, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { Request } from 'express';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';

@Injectable()
export class RealAuthenticationService implements AuthenticationService {
  constructor(private logger: PinoLoggerService, private jwtService: JwtService) {
    this.logger.setContext('AuthenticationService');
  }
  createJWT = (user: User): TaskEither<Error, JWT> => {
    return tryCatch(
      async () => {
        const payload = { id: user.id, email: user.contactInformation.email, isVerified: user.contactInformation.isVerified };
        return JWT.check(this.jwtService.sign(payload));
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
        async () => await this.jwtService.verify(bearerToken, {secret: jwtConstants.secret}),
        (error) => new Error(`Verification failed: ${error}`),
      ),
      map((decodedToken) => {
        this.logger.debug(`Verification succeed: ${JSON.stringify(decodedToken)}`);
        return;
      }),
    );
  }
}
