import { CoreLogger } from '@common/logger/adapters/pinoLogger.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { chain, right, map, left } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { executeTask } from '@common/utils/executeTask';
import { perform } from '@common/utils/perform';
import { User } from '@identity-and-access/domain/entities/user';
import { fromUnknown } from '@common/utils/fromUnknown';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/passwordHashing.service';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/uuidGenerator.service';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/inMemoryUser.repository';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { UnverifiedEmail } from '@identity-and-access/domain/value-objects/emailInfos';
import { ConflictException } from '@nestjs/common';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: UUIDGeneratorService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly userRepository: InMemoryUserRepository,
    private readonly logger: CoreLogger,
  ) {
    this.logger.setContext('SignUp');
  }

  execute(command: SignUp): Promise<void> {
    const { email, password } = command;

    const task = pipe(
      //Data validation
      sequenceS(taskEither)({
        id: fromUnknown(this.uuidGeneratorService.generateUUID(), UUID, this.logger, 'uuid'),
        email: fromUnknown(email, UnverifiedEmail, this.logger, 'email'),
        plainPassword: fromUnknown(password, PlainPassword, this.logger, 'plain password'),
      }),
      //Get existing user by email
      chain((validatedDatas) =>
        sequenceT(taskEither)(perform(validatedDatas.email, this.userRepository.getByEmail, this.logger, 'get user by email'), right(validatedDatas)),
      ),
      //Check email unicity
      chain(([existingUser, validatedDatas]) => {
        if (existingUser == null) {
          return right(validatedDatas);
        }
        return left(new ConflictException('Email already exists.'));
      }),
      //Password hashing
      chain((validatedDatas) =>
        sequenceT(taskEither)(
          perform(validatedDatas.plainPassword, this.passwordHashingService.hash, this.logger, 'hash plain password'),
          right(validatedDatas),
        ),
      ),
      //Create domain entity
      chain(([hashedPassword, validatedDatas]) =>
        fromUnknown(
          {
            id: validatedDatas.id,
            email: validatedDatas.email,
            password: hashedPassword,
          },
          User,
          this.logger,
          'user',
        ),
      ),
      //Storage
      chain((user) => perform(user, this.userRepository.save, this.logger, 'save user in storage system.')),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => {};
