import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { MockedLoggerService } from '@common/logger/adapters/mockedLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { DefaultHashingService } from '@identity-and-access/adapters/secondaries/real/defaultHashing.service';
import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { SignUp, SignUpHandler } from '@identity-and-access/use-cases/commands/signUp.command';
import { Test } from '@nestjs/testing';

//Adapters
let userRepository: InMemoryUserRepository;

describe('[Unit] Sign up with credentials', () => {
  let signUpHandler: SignUpHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DomainEventPublisherModule],
      providers: [
        SignUpHandler,
        DefaultUUIDGeneratorService,
        DefaultHashingService,
        { provide: UserRepository, useClass: InMemoryUserRepository },
        { provide: PinoLoggerService, useClass: MockedLoggerService },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository) as InMemoryUserRepository;
    signUpHandler = moduleRef.get<SignUpHandler>(SignUpHandler);
  });

  it('OK - Should sign up a user if email and passwords are valid', async () => {
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

  it('OK - Should have set the user as unverified if he successfully signed up', async () => {
    //Given a potentially valid email
    const email = 'dummy1@gmail.com';
    const password = 'paSSw0rd!';

    //When we create a user
    const result = await signUpHandler.execute(new SignUp(email, password));

    //Then the user should not be verified
    const users = await executeTask(userRepository.all());
    expect(users[0].isVerified).toEqual(false);
  });

  //TODO: Check if the domain event is effectively emitted.

  it('KO - Should not create a user if email is invalid', async () => {
    //Given a potentially invalid email
    const email = 'abc123';
    const password = 'paSSw0rd!';
    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeTruthy();

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(0);
  });

  it('KO - Should not create a user if password is invalid', async () => {
    //Given a potentially invalid password
    const email = 'dummy1@gmail.com';
    const password = 'toosimple';

    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeTruthy();

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(0);
  });

  it('KO - Should not create a user if email already exists', async () => {
    //Given an existing user
    const email = 'dummy1@gmail.com';
    const password = 'paSSw0rd!';

    //When we create two users with the same email
    await signUpHandler.execute(new SignUp(email, password));
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    await expect(resultPromise).rejects.toBeTruthy();
  });
});
