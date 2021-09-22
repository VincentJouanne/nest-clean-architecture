import { Email } from '@notifications/domain/value-objects/email';
import { Record, Static } from 'runtypes';
import { VerificationCode4 } from '../value-objects/verificationCode4';

export const USER_REGISTERED = 'user.registered';

export const UserRegisteredEvent = Record({
  email: Email,
  verificationCode: VerificationCode4
});

export type UserRegisteredEvent = Static<typeof UserRegisteredEvent>;
