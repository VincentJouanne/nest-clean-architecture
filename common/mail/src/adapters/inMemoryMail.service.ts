import { Injectable } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { MailService } from '../domain/services/mail.service';

@Injectable()
export class InMemoryMailService implements MailService {
  sendEmail = (): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        console.log('Send email...');
        return;
      },
      (error: Error) => error,
    );
  };
}
