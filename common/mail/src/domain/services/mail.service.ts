import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface MailService {
  sendEmail: () => TaskEither<Error, void>;
}
