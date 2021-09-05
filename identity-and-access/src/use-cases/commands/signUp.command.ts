import { DomainEventPublisher } from '@common/domain-event-publisher/adapters/domainEventPublisher';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Email } from '@common/mail/domain/value-objects/email';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { perform } from '@common/utils/perform';
import { DefaultHashingService } from '@identity-and-access/adapters/secondaries/real/defaultHashing.service';
import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { User, UserId } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import { chain, left, map, right, taskEither } from 'fp-ts/lib/TaskEither';
import { USER_CREATED } from '../listeners/userEvent.listener';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: DefaultUUIDGeneratorService,
    private readonly hashingService: DefaultHashingService,
    private readonly userRepository: UserRepository,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext('SignUp');
  }

  execute(command: SignUp): Promise<void> {
    const { email, password } = command;

    const task = pipe(
      //Data validation
      sequenceS(taskEither)({
        id: fromUnknown(this.uuidGeneratorService.generateUUID(), UserId, this.logger, 'uuid'),
        email: fromUnknown(email, Email, this.logger, 'email'),
        plainPassword: fromUnknown(password, PlainPassword, this.logger, 'password'),
      }),
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
      //Use-case process
      chain((validatedDatas) =>
        sequenceT(taskEither)(
          perform(validatedDatas.plainPassword, this.hashingService.hashPlainPassword, this.logger, 'hash plain password'),
          right(validatedDatas),
        ),
      ),
      //Create Domain entity
      chain(([hashedPassword, validatedDatas]) =>
        fromUnknown(
          {
            id: validatedDatas.id,
            email: validatedDatas.email,
            isVerified: false,
            password: hashedPassword,
          },
          User,
          this.logger,
          'user',
        ),
      ),
      //Store entity
      chain((user) => sequenceT(taskEither)(perform(user, this.userRepository.save, this.logger, 'save user in storage system.'), right(user))),
      //Emit domain event
      chain(([nothing, user]) =>
        perform(
          { eventKey: USER_CREATED, payload: { email: user.email } },
          this.domainEventPublisher.publishEvent,
          this.logger,
          'emit user created event.',
        ),
      ),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => {};
