import { TaskEither } from 'fp-ts/lib/TaskEither';
import { HashedPassword, PlainPassword } from '../../domain/value-objects/password';

export interface IHashingService {
  hashPlainPassword: (password: PlainPassword) => TaskEither<Error, HashedPassword>;
  assertSamePasswords: ({
    plainPassword,
    hashedPassword,
  }: {
    plainPassword: PlainPassword;
    hashedPassword: HashedPassword;
  }) => TaskEither<Error, Boolean>;
}
