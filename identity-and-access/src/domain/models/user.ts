import { Static, Record } from 'runtypes';
import { Email } from '@identity-and-access/domain/models/email';
import { UUID } from '@identity-and-access/domain/models/uuid';
import { GeneratedTag6 } from './generatedTag6';
import { HashedPassword } from './password';

export const User = Record({
  id: UUID.withBrand('UserId'),
  tag: GeneratedTag6,
  email: Email,
  password: HashedPassword,
});

export type User = Static<typeof User>;
