import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { HashingService } from '@identity-and-access/domain/services/hashing.service';
import { HashedPassword, PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

const saltOrRounds = 10;

@Injectable()
export class DefaultHashingService implements HashingService {
  constructor(private logger: PinoLoggerService) {
    this.logger.setContext('HashingService');
  }

  hashPlainPassword = (plainPassword: PlainPassword): TaskEither<Error, HashedPassword> => {
    return tryCatch(
      async () => {
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return HashedPassword.check(hash);
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
  assertSamePasswords = ({
    plainPassword,
    hashedPassword,
  }: {
    plainPassword: PlainPassword;
    hashedPassword: HashedPassword;
  }): TaskEither<Error, Boolean> => {
    return tryCatch(
      async () => {
        return await bcrypt.compare(plainPassword, hashedPassword);
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
