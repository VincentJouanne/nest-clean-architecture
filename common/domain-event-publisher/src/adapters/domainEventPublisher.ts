import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { noop } from '@common/utils/noop';
import { perform } from '@common/utils/perform';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { pipe } from 'fp-ts/lib/function';
import { map, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

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
