import { Static, Record } from 'runtypes';
import { Email } from '@identity-and-access/domain/value-objects/email';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { HashedPassword } from '../value-objects/password';
import { EmailInfos } from '../value-objects/emailInfos';

export const User = Record({
  id: UUID.withBrand('UserId'),
  email: EmailInfos,
  password: HashedPassword,
});

export type User = Static<typeof User>;
