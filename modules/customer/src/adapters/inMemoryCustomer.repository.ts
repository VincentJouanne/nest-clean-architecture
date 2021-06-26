import { left, right, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { Customer } from '@modules/customer/domain/customer';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';

export class InMemoryCustomerRepository implements CustomerRepository {
  private customers: Customer[] = [];

  save = (customer: Customer): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.customers.push(customer);
        return;
      },
      (error: Error) => error,
    );
  };

  all = (): TaskEither<Error, Customer[]> => {
    return tryCatch(
      async () => {
        return this.customers;
      },
      (error: Error) => error,
    );
  };
}
