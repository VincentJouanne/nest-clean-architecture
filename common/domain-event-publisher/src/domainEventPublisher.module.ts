import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DomainEventPublisher } from './adapters/domainEventPublisher';

@Global()
@Module({
  imports: [DomainEventPublisher, EventEmitterModule.forRoot()],
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class DomainEventPublisherModule {}
