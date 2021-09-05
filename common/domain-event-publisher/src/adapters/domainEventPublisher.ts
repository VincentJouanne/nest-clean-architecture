import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { DomainEvent } from '../domain/domainEvent';

@Injectable()
export class DomainEventPublisher {
  constructor(private eventEmitter: EventEmitter2) {}

  publishEvent = (domainEvent: DomainEvent): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.eventEmitter.emit(domainEvent.eventKey, domainEvent.payload);
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
