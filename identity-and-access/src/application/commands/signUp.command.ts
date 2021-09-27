import { DomainEventPublisher } from '@common/domain-event-publisher/adapters/domainEventPublisher';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { perform } from '@common/utils/perform';
import { User, UserId } from '@identity-and-access/domain/entities/user';
import { USER_REGISTERED } from '@identity-and-access/domain/events/userRegistered.event';
import { EmailAlreadyExistsException } from '@identity-and-access/domain/exceptions/emailAlreadyExists.exception';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { RealHashingService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realHashing.service';
import { RealRandomNumberGenerator } from '@identity-and-access/infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { RealUUIDGeneratorService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/infrastructure/ports/user.repository';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Email } from '@notifications/domain/value-objects/email';
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { pipe } from 'fp-ts/lib/function';
import { chain, left, map, right, taskEither } from 'fp-ts/lib/TaskEither';

export class SignUp implements ICommand {
  constructor(public readonly email: string, public readonly password: string) { }
}

@CommandHandler(SignUp)
export class SignUpHandler implements ICommandHandler {
  constructor(
    private readonly uuidGeneratorService: RealUUIDGeneratorService,
    private readonly randomNumberGenerator: RealRandomNumberGenerator,
    private readonly hashingService: RealHashingService,
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
        return left(new EmailAlreadyExistsException());
      }),
      //Use-case process
      chain((validatedDatas) =>
        sequenceT(taskEither)(
          perform(validatedDatas.plainPassword, this.hashingService.hashPlainPassword, this.logger, 'hash plain password'),
          perform({}, this.randomNumberGenerator.generateRandomVerificationCode, this.logger, 'generate random verfication code'),
          right(validatedDatas),
        ),
      ),
      //Create Domain entity
      chain(([hashedPassword, verificationCode, validatedDatas]) =>
        fromUnknown(
          {
            id: validatedDatas.id,
            password: hashedPassword,
            contactInformation: {
              email: validatedDatas.email,
              verificationCode: verificationCode,
              isVerified: false,
            },
          },
          User,
          this.logger,
          'user',
        ),
      ),
      //Store entity
      chain((user) => sequenceT(taskEither)(perform(user, this.userRepository.save, this.logger, 'save user in storage system.'), right(user))),
      //Emit domain event
      chain(([_, user]) =>
        perform(
          { eventKey: USER_REGISTERED, payload: { email: user.contactInformation.email, verificationCode: user.contactInformation.verificationCode } },
          this.domainEventPublisher.publishEvent,
          this.logger,
          'emit user registered event.',
        ),
      ),
      map(noop),
    );
    return executeTask(task);
  }
}

const noop = () => { };
