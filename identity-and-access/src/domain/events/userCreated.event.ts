import { Email } from '@notifications/domain/value-objects/email';
import { Record, Static } from 'runtypes';

export const USER_CREATED = 'user.created';

export const UserCreatedEvent = Record({
  email: Email
});

export type UserCreatedEvent = Static<typeof UserCreatedEvent>;
