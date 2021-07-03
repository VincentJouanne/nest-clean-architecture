import { EncryptedPassword, PlainPassword } from '../domain/password';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export class PasswordHashingService {
  encrypt = (plainPassword: PlainPassword): TaskEither<Error, EncryptedPassword> => {
    return tryCatch(
      async () => {
        const hash = await bcrypt.hash(plainPassword, saltOrRounds);
        return EncryptedPassword.check(hash);
      },
      (error: Error) => error,
    );
  };
}
