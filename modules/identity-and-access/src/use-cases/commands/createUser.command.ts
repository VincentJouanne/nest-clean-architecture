import { CoreLogger } from '@core/logger/logger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@shared/utils/executeTask';
import { UserRepository } from '@modules/identity-and-access/domain/repositories/user.repository';
import { perform } from '@shared/utils/perform';
import { User } from '@modules/identity-and-access/domain/user';
import { TagGeneratorService } from 'modules/identity-and-access/src/domain/services/tagGenerator.service';
import { fromUnknown } from '@shared/utils/fromUnknown';
import { UUIDGeneratorService } from '@shared/domain/services/UUIDGenerator.service';

export class CreateUser implements ICommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly tagGeneratorService: TagGeneratorService,
    private readonly userRepository: UserRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('CreateUser');
  }

  execute(command: CreateUser): Promise<void> {
    const task = pipe(
      right(command.email),
      chain((maybeEmail) =>
        fromUnknown(
          { id: this.uuidGeneratorService.generateUUID(), tag: this.tagGeneratorService.generateTag6(), email: maybeEmail },
          User,
          this.logger,
          'user',
        ),
      ),
      chain((user) => perform(user, this.userRepository.save, this.logger, 'save user in storage system.')),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => {};
