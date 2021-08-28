import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class DomainEventPublisher {
  constructor(private eventEmitter: EventEmitter2) {}

  publishEvent = (eventKey: string): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.eventEmitter.emit(eventKey);
      },
      (error: Error) => error,
    );
  };
}
