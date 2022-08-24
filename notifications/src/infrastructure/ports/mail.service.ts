import { VerificationCodeEmailPayload } from '@notifications/domain/value-objects/verificationCodeEmailPayload';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface MailService {
  sendEmail: (payload: VerificationCodeEmailPayload) => TaskEither<Error, void>;
}
