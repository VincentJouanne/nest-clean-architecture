import { User } from '@call-identification/domain/entities/user';
import { FakeUserRepository } from '@call-identification/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { noop } from '@common/utils/noop';
import { perform } from '@common/utils/perform';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { pipe } from 'fp-ts/lib/function';
import { chain, map, right } from 'fp-ts/lib/TaskEither';

export class AddUser implements ICommand {
  constructor(public readonly user: User) {}
}

@CommandHandler(AddUser)
export class AddUserHandler implements ICommandHandler {
  constructor(private readonly userRepository: FakeUserRepository, private readonly logger: PinoLoggerService) {}

  execute(command: AddUser): Promise<void> {
    const task = pipe(
      right(command.user),
      chain((user) => fromUnknown(user, User, this.logger, 'user')),
      chain((userValidated) => perform(userValidated, this.userRepository.save, this.logger, 'save user in storage system')),
      map(noop),
    );

    return executeTask(task);
  }
}
