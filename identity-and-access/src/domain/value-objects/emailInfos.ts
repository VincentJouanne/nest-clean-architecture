import { Email } from '@common/mail/domain/value-objects/email';
import { Static, Union } from 'runtypes';

export const UnverifiedEmail = Email.withBrand('UnverifiedEmail');
export type UnverifiedEmail = Static<typeof UnverifiedEmail>;

export const VerifiedEmail = Email.withBrand('VerifiedEmail');
export type VerifiedEmail = Static<typeof VerifiedEmail>;

export const EmailInfos = Union(UnverifiedEmail, VerifiedEmail);
