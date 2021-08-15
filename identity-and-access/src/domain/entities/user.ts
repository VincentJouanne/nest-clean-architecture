import { Static, Record } from 'runtypes';
import { Email } from '@identity-and-access/domain/value-objects/email';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { HashedPassword } from '../value-objects/password';

export const User = Record({
  id: UUID.withBrand('UserId'),
  email: Email,
  password: HashedPassword,
});

export type User = Static<typeof User>;
