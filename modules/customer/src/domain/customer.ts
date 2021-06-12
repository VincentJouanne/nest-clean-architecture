import { String, Static, Record } from 'runtypes';
import { Email } from 'shared/domain/email';
import { Password } from 'shared/domain/password';
import { UUID } from 'shared/domain/uuid';

const Customer = Record({
  id: UUID.withBrand('CustomerId'),
  email: Email.withBrand('CustomerEmail'),
  password: Password.withBrand('Password'),
});

type Customer = Static<typeof Customer>;
