import { Email } from '@notifications/domain/value-objects/email';
import { Record, Static } from 'runtypes';

export const USER_REGISTERED = 'user.registered';

export const UserRegisteredEvent = Record({
  email: Email
});

export type UserRegisteredEvent = Static<typeof UserRegisteredEvent>;
