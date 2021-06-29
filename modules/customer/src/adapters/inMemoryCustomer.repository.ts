import { left, right, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { Customer } from '@modules/customer/domain/customer';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';

export class InMemoryCustomerRepository implements CustomerRepository {
  private customers: Customer[] = [];

  save = (customer: Customer): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        const existingCustomer = this.customers.find((c) => c.email == customer.email);
        if (existingCustomer == undefined) this.customers.push(customer);
        else throw new Error('Email already exists.');
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
