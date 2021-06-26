import { TaskEither } from 'fp-ts/lib/TaskEither';
import { RuntypeBrand } from 'runtypes';
import { Customer } from '../customer';

export interface CustomerRepository {
  save: (customer: Customer) => TaskEither<Error, void>;
}
