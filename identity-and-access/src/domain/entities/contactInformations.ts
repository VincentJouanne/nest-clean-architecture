import { Email } from '@common/mail/domain/value-objects/email';
import { Boolean, Record, Static } from 'runtypes';
import { VerificationCode4 } from '../value-objects/verificationCode6';

export const ContactInformations = Record({
  email: Email,
  verificationCode: VerificationCode4,
  isVerified: Boolean,
});

export type ContactInformations = Static<typeof ContactInformations>;
