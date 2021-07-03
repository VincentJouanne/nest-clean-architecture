import { HashedPassword, PlainPassword } from '../domain/password';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

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
