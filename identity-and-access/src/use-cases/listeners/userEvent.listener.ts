import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { InMemoryMailService } from '@common/mail/adapters/inMemoryMail.service';
import { executeTask } from '@common/utils/executeTask';
import { noop } from '@common/utils/noop';
import { perform } from '@common/utils/perform';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { pipe } from 'fp-ts/lib/function';
import { map } from 'fp-ts/lib/TaskEither';

@Injectable()
export class UserEventListener {
  constructor(private logger: PinoLoggerService, private mailService: InMemoryMailService) {}
  @OnEvent('user.created')
  async handleUserCreatedEvent() {
    console.log('Oh, a user has been created !');
    executeTask(pipe(perform({}, this.mailService.sendEmail, this.logger, 'send verification email'), map(noop)));
  }
}
