import { Static, Record } from 'runtypes';
import { Email } from '@shared/domain/email';
import { UUID } from '@shared/domain/uuid';
import { GeneratedTag6 } from './generatedTag6';

export const Customer = Record({
  id: UUID.withBrand('CustomerId'),
  tag: GeneratedTag6.withBrand('CustomerTag'),
  email: Email.withBrand('CustomerEmail'),
});

export type Customer = Static<typeof Customer>;
