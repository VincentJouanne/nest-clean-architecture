import { Email } from '@common/mail/domain/value-objects/email';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { MailService } from '../domain/services/mail.service';

@Injectable()
export class InMemoryMailService implements MailService {
  sendEmail = (email: Email): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        console.log('Sending email to: ', email);
        return;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
