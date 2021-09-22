import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { VerificationCodeEmailPayload } from '@notifications/domain/value-objects/verificationCodeEmailPayload';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { MailService } from '../../../../domain/services/mail.service';

@Injectable()
export class InMemoryMailService implements MailService {
  sendEmail = (payload: VerificationCodeEmailPayload): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        console.log(`Sending email to: ${payload.to} with verification code: ${payload.verificationCode}`);
        return;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
