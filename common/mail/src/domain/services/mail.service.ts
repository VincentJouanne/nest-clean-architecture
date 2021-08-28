import { Email } from '@identity-and-access/domain/value-objects/email';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface MailService {
  sendEmail: (email: Email) => TaskEither<Error, void>;
}
