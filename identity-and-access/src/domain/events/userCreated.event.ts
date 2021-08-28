import { Record, Static } from 'runtypes';
import { Email } from '../value-objects/email';

export const UserCreatedEvent = Record({
  email: Email,
});

export type UserCreatedEvent = Static<typeof UserCreatedEvent>;
