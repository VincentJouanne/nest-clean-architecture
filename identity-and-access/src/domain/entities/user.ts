import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { Record, Static } from 'runtypes';
import { HashedPassword } from '../value-objects/password';
import { ContactInformation } from '../value-objects/contactInformation';

export const UserId = UUID.withBrand('UserId');
export type UserId = Static<typeof UserId>;

export const User = Record({
  id: UserId,
  password: HashedPassword,
  contactInformation: ContactInformation,
});
export type User = Static<typeof User>;
