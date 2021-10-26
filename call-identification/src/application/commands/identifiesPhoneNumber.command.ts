import { User } from '@call-identification/domain/entities/user';
import { UserNotFoundException } from '@call-identification/domain/exceptions/userNotFound.exception';
import { FakeUserRepository } from '@call-identification/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { perform } from '@common/utils/perform';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { pipe } from 'fp-ts/lib/function';
import { chain, left, right } from 'fp-ts/lib/TaskEither';

export class IdentifiesPhoneNumber implements ICommand {
  constructor(public readonly phoneNumber: string) {}
}

@CommandHandler(IdentifiesPhoneNumber)
export class IdentifiesPhoneNumberHandler implements ICommandHandler {
  constructor(private readonly userRepository: FakeUserRepository, private readonly logger: PinoLoggerService) {
    this.logger.setContext('IdentifiesPhoneNumber');
  }

  execute(command: IdentifiesPhoneNumber): Promise<User> {
    const task = pipe(
      right(command.phoneNumber),
      chain((phoneNumber) => perform(phoneNumber, this.userRepository.getByPhoneNumber, this.logger, 'get user by phone number')),
      chain((user) => {
        if (user == null) {
          return left(new UserNotFoundException());
        } else {
          return right(user);
        }
      }),
    );
    return executeTask(task);
  }
}
