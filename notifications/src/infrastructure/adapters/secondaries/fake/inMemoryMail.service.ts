import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { VerificationCodeEmailPayload } from '@notifications/domain/value-objects/verificationCodeEmailPayload';
import { MailService } from '@notifications/infrastructure/ports/mail.service';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

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
