import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { IdentityAndAccessAdaptersModule } from '@identity-and-access/adapters/identityAndAccess.adapters';
import { Module } from '@nestjs/common';
import { SignUpHandler } from './commands/signUp.command';
import { UserEventListener } from './listeners/userEvent.listener';

const commandHandlers = [SignUpHandler];
const eventListeners = [UserEventListener];
@Module({
  imports: [IdentityAndAccessAdaptersModule, DomainEventPublisherModule],
  providers: [...commandHandlers, ...eventListeners],
})
export class IdentityAndAccessUseCasesModule {}
