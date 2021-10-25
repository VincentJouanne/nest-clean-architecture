import { LOGGER } from '@common/logger/logger.module';
import { HashedPassword, PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { IHashingService } from '@identity-and-access/infrastructure/ports/hashing.service';
import { ConsoleLogger, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

const saltOrRounds = 10;

@Injectable()
export class RealHashingService implements IHashingService {
  constructor(
    @Inject(LOGGER)
    private readonly logger: ConsoleLogger,
  ) {
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
