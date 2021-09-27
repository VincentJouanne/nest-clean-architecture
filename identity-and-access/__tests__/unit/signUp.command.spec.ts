import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { SignUp, SignUpHandler } from '@identity-and-access/application/commands/signUp.command';
import { EmailAlreadyExistsException } from '@identity-and-access/domain/exceptions/emailAlreadyExists.exception';
import { FakeUserRepository } from '@identity-and-access/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { RealHashingService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realHashing.service';
import { RealRandomNumberGenerator } from '@identity-and-access/infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { RealUUIDGeneratorService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/infrastructure/ports/user.repository';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

//Adapters
let userRepository: FakeUserRepository;

describe('[Unit] Sign up with credentials', () => {
  let signUpHandler: SignUpHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DomainEventPublisherModule],
      providers: [
        SignUpHandler,
        RealUUIDGeneratorService,
        RealRandomNumberGenerator,
        RealHashingService,
        { provide: UserRepository, useClass: FakeUserRepository },
        { provide: PinoLoggerService, useClass: FakeLoggerService },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository) as FakeUserRepository;
    signUpHandler = moduleRef.get<SignUpHandler>(SignUpHandler);
  });

  it('Should sign up a user if email and passwords are valid', async () => {
    //Given a potentially valid email
    const email = 'dummy1@gmail.com';
    const password = 'paSSw0rd!';

    //When we create a user
    const result = await signUpHandler.execute(new SignUp(email, password));

    //Then it should have created a user
    expect(result).toEqual(undefined);

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(1);
  });

  it('Should have set the user as unverified if he successfully signed up', async () => {
    //Given a potentially valid email
    const email = 'dummy1@gmail.com';
    const password = 'paSSw0rd!';

    //When we create a user
    const result = await signUpHandler.execute(new SignUp(email, password));

    //Then the user should not be verified
    const users = await executeTask(userRepository.all());
    expect(users[0].contactInformation.isVerified).toEqual(false);
  });

  //TODO: Check if the domain event is effectively emitted.

  it('Should not create a user if email is invalid', async () => {
    //Given a potentially invalid email
    const email = 'abc123';
    const password = 'paSSw0rd!';
    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(0);
  });

  it('Should not create a user if password is invalid', async () => {
    //Given a potentially invalid password
    const email = 'dummy1@gmail.com';
    const password = 'toosimple';

    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(0);
  });

  it('Should not create a user if email already exists', async () => {
    //Given an existing user
    const email = 'dummy1@gmail.com';
    const password = 'paSSw0rd!';

    //When we create two users with the same email
    await signUpHandler.execute(new SignUp(email, password));
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    await expect(resultPromise).rejects.toBeInstanceOf(EmailAlreadyExistsException);
  });
});
