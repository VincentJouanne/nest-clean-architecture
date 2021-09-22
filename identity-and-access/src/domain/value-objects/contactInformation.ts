import { Email } from '@notifications/domain/value-objects/email';
import { Boolean, Record, Static } from 'runtypes';
import { VerificationCode4 } from './verificationCode4';

export const ContactInformation = Record({
  email: Email,
  verificationCode: VerificationCode4,
  isVerified: Boolean,
});

export type ContactInformation = Static<typeof ContactInformation>;
