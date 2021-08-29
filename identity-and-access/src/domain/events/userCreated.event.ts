import { Email } from '@common/mail/domain/value-objects/email';
import { Record, Static } from 'runtypes';

export const UserCreatedEvent = Record({
  email: Email,
});

export type UserCreatedEvent = Static<typeof UserCreatedEvent>;
