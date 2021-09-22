import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Email } from '../value-objects/email';

export interface MailService {
  sendEmail: (email: Email) => TaskEither<Error, void>;
}
