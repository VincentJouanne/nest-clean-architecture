import { CoreLogger } from '@core/logger/logger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@shared/utils/executeTask';
import { CustomerRepository } from '@modules/customer/domain/repositories/customer.repository';
import { perform } from '@shared/utils/perform';
import { Customer } from '@modules/customer/domain/customer';
import { TagGeneratorService } from '@modules/customer/domain/services/tagGenerator.service';
import { fromUnknown } from '@shared/utils/fromUnknown';
import { UUIDGeneratorService } from '@shared/domain/services/UUIDGenerator.service';

export class CreateCustomer implements ICommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(CreateCustomer)
export class CreateCustomerHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly tagGeneratorService: TagGeneratorService,
    private readonly customerRepository: CustomerRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('CreateCustomer');
  }

  execute(command: CreateCustomer): Promise<void> {
    const task = pipe(
      right(command.email),
      chain((maybeEmail) =>
        fromUnknown(
          { id: this.uuidGeneratorService.generateUUID(), tag: this.tagGeneratorService.generateTag6(), email: maybeEmail },
          Customer,
          this.logger,
          'customer',
        ),
      ),
      chain((customer) => perform(customer, this.customerRepository.save, this.logger, 'save customer in storage system.')),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => {};
