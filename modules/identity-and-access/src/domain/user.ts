import { Static, Record } from 'runtypes';
import { Email } from '@shared/domain/email';
import { UUID } from '@shared/domain/uuid';
import { GeneratedTag6 } from './generatedTag6';

export const User = Record({
  id: UUID.withBrand('UserId'),
  tag: GeneratedTag6.withBrand('UserTag'),
  email: Email.withBrand('UserEmail'),
});

export type User = Static<typeof User>;
