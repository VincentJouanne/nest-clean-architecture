import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SendEmailHandler } from './application/commands/sendEmail';
import { IdentityAndAccessEventsSubscriber } from './infrastructure/adapters/primaries/identityAndAccessEvents.subscriber';
import { InMemoryMailService } from './infrastructure/adapters/secondaries/fake/inMemoryMail.service';

@Global()
@Module({
  imports: [CqrsModule, InMemoryMailService],
  providers: [InMemoryMailService, IdentityAndAccessEventsSubscriber, SendEmailHandler],
  exports: [InMemoryMailService, IdentityAndAccessEventsSubscriber],
})
export class NotificationsModule {}
