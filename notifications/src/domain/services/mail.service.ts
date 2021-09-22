import { TaskEither } from 'fp-ts/lib/TaskEither';
import { VerificationCodeEmailPayload } from '../value-objects/verificationCodeEmailPayload';

export interface MailService {
  sendEmail: (payload: VerificationCodeEmailPayload) => TaskEither<Error, void>;
}
