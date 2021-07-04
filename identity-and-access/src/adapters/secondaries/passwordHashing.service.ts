import { HashedPassword, PlainPassword } from '@identity-and-access/domain/models/password';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

const saltOrRounds = 10;

@Injectable()
export class PasswordHashingService {
  hash = (plainPassword: PlainPassword): TaskEither<Error, HashedPassword> => {
    return tryCatch(
      async () => {
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return HashedPassword.check(hash);
      },
      (error: Error) => error,
    );
  };
}
