import { TaskEither } from 'fp-ts/lib/TaskEither';
import { EncryptedPassword, PlainPassword } from '../password';

export interface IEncryptionService {
  encrypt: (plainPassword: PlainPassword) => TaskEither<Error, EncryptedPassword>;
}
