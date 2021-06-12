import { CoreLogger } from '@core/log/logger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

export class SignUpCustomer implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

const noop = () => {};

@CommandHandler(SignUpCustomer)
export class SignUpCustomerHandler implements ICommandHandler {
  constructor(private readonly logger: CoreLogger) {
    this.logger.setContext('CustomerSignUp');
  }

  execute(command: SignUpCustomer): Promise<void> {
    return;
  }
}
