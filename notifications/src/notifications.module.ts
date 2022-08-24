import { LoggerModule } from '@common/logger/logger.module';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SendVerificationCodeEmailHandler } from './application/commands/sendVerificationCodeEmail.command';
import { IdentityAndAccessEventsSubscriber } from './infrastructure/adapters/primaries/identityAndAccessEvents.subscriber';
import { InMemoryMailService } from './infrastructure/adapters/secondaries/fake/inMemoryMail.service';

@Global()
@Module({
  imports: [CqrsModule, InMemoryMailService, LoggerModule],
  providers: [InMemoryMailService, IdentityAndAccessEventsSubscriber, SendVerificationCodeEmailHandler],
  exports: [InMemoryMailService, IdentityAndAccessEventsSubscriber],
})
export class NotificationsModule {}
