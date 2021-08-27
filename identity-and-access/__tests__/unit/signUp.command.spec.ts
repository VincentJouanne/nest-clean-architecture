import { DomainEventPublisher } from '@common/domain-event-publisher/adapters/domainEventPublisher';
import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { MockLoggerService } from '@common/logger/adapters/basicLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { InMemoryMailService } from '@common/mail/adapters/inMemoryMail.service';
import { MailModule } from '@common/mail/mail.module';
import { executeTask } from '@common/utils/executeTask';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { DefaultAuthenticationService } from '@identity-and-access/adapters/secondaries/real/defaultAuthentication.service';
import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { SignUp, SignUpHandler } from '@identity-and-access/use-cases/commands/signUp.command';
import { UserEventListener } from '@identity-and-access/use-cases/listeners/userEvent.listener';
import { Test } from '@nestjs/testing';

describe('[Unit] Sign up with credentials', () => {
  //Adapters
  let uuidGeneratorService: DefaultUUIDGeneratorService;
  let authenticationService: DefaultAuthenticationService;
  let userRepository: InMemoryUserRepository;
  let domainEventPublisher: DomainEventPublisher;
  let logger: MockLoggerService;

  //Use-case
  let signUpHandler: SignUpHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, DomainEventPublisherModule, MailModule],
      providers: [
        DefaultUUIDGeneratorService,
        DefaultAuthenticationService,
        InMemoryUserRepository,
        MockLoggerService,
        DomainEventPublisher,
        UserEventListener,
        InMemoryMailService,
      ],
    }).compile();

    uuidGeneratorService = moduleRef.get<DefaultUUIDGeneratorService>(DefaultUUIDGeneratorService);
    authenticationService = moduleRef.get<DefaultAuthenticationService>(DefaultAuthenticationService);
    userRepository = moduleRef.get<InMemoryUserRepository>(InMemoryUserRepository);
    domainEventPublisher = moduleRef.get<DomainEventPublisher>(DomainEventPublisher);
    logger = moduleRef.get<MockLoggerService>(MockLoggerService);

    signUpHandler = new SignUpHandler(uuidGeneratorService, authenticationService, userRepository, domainEventPublisher, logger);
  });

  it('OK - Should sign up a user if email and passwords are valid', async () => {
    //Given a potentially valid email
    const email = 'dummy@gmail.com';
    const password = 'paSSw0rd!';

    //When we create a user
    const result = await signUpHandler.execute(new SignUp(email, password));

    //Then it should have created a user
    expect(result).toEqual(undefined);

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(1);
  });

  it('OK - Should have emitted an event if user successfully signed up', async () => {
    const publishEvent = jest.spyOn(domainEventPublisher, 'publishEvent');

    //Given a potentially valid email
    const email = 'dummy@gmail.com';
    const password = 'paSSw0rd!';

    //When we create a user
    await signUpHandler.execute(new SignUp(email, password));

    //Then it should have emitted a user.created event
    expect(publishEvent).toHaveBeenCalledWith('user.created');
  });

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
    await signUpHandler.execute(new SignUp(email, password));

    //When we create a user with the same email
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user if the email already exists
    await expect(resultPromise).rejects.toBeTruthy();
  });
});
