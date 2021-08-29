import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { HashedPassword, PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

const saltOrRounds = 10;

@Injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  constructor(private logger: PinoLoggerService) {
    this.logger.setContext('AuthenticationService');
  }

  //TODO: Do this in a hashing service
  hashPlainPassword = (plainPassword: PlainPassword): TaskEither<Error, HashedPassword> => {
    return tryCatch(
      async () => {
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return HashedPassword.check(hash);
      },
      (error: Error) => error,
    );
  };
}
