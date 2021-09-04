import { Email } from '@common/mail/domain/value-objects/email';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { Boolean, Record, Static } from 'runtypes';
import { HashedPassword } from '../value-objects/password';

export const UserId = UUID.withBrand('UserId');
export type UserId = Static<typeof UserId>;

export const User = Record({
  id: UserId,
  email: Email,
  isVerified: Boolean,
  password: HashedPassword,
});
export type User = Static<typeof User>;
