import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { InMemoryMailService } from '@common/mail/adapters/inMemoryMail.service';
import { executeTask } from '@common/utils/executeTask';
import { noop } from '@common/utils/noop';
import { perform } from '@common/utils/perform';
import { UserCreatedEvent } from '@identity-and-access/domain/events/userCreated.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { pipe } from 'fp-ts/lib/function';
import { map } from 'fp-ts/lib/TaskEither';

export const USER_CREATED = 'user.created';
@Injectable()
export class UserEventListener {
  constructor(private logger: PinoLoggerService, private mailService: InMemoryMailService) {}

  @OnEvent(USER_CREATED)
  async handleUserCreatedEvent(payload: UserCreatedEvent) {
    console.log('Oh, a user has been created !');
    executeTask(pipe(perform(payload.email, this.mailService.sendEmail, this.logger, 'send verification email'), map(noop)));
  }
}
