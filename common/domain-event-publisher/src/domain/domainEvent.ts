import { UserCreatedEvent } from '@identity-and-access/domain/events/userCreated.event';
import { Record, Static, String } from 'runtypes';

export const DomainEvent = Record({
  eventKey: String,
  //TODO: Refactor, add a master type that aggregate all future domain events with an union
  payload: UserCreatedEvent,
});

export type DomainEvent = Static<typeof DomainEvent>;
