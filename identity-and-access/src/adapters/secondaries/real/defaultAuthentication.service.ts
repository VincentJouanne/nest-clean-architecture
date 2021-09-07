import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { User } from '@identity-and-access/domain/entities/user';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { JWT } from '@identity-and-access/domain/value-objects/jwt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  constructor(private logger: PinoLoggerService, private jwtService: JwtService) {
    this.logger.setContext('AuthenticationService');
  }
  createJWT = (user: User): TaskEither<Error, JWT> => {
    return tryCatch(
      async () => {
        const payload = { id: user.id, email: user.email };
        return JWT.check(this.jwtService.sign(payload));
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
