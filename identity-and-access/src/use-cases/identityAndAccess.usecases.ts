import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { LoggerModule } from '@common/logger/logger.module';
import { MailModule } from '@common/mail/mail.module';
import { IdentityAndAccessAdaptersModule } from '@identity-and-access/adapters/identityAndAccess.adapters';
import { Module } from '@nestjs/common';
import { SignInHandler } from './commands/signIn.command';
import { SignUpHandler } from './commands/signUp.command';
import { UserEventListener } from './listeners/userEvent.listener';

const commandHandlers = [SignUpHandler, SignInHandler];
const eventListeners = [UserEventListener];
@Module({
  imports: [IdentityAndAccessAdaptersModule, DomainEventPublisherModule, LoggerModule, MailModule],
  providers: [...commandHandlers, ...eventListeners],
})
export class IdentityAndAccessUseCasesModule {}
