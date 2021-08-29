import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { Record, Static } from 'runtypes';
import { EmailInfos } from '../value-objects/emailInfos';
import { HashedPassword } from '../value-objects/password';

export const UserId = UUID.withBrand('UserId');
export type UserId = Static<typeof UserId>;

export const User = Record({
  id: UserId,
  email: EmailInfos,
  password: HashedPassword,
});
export type User = Static<typeof User>;
