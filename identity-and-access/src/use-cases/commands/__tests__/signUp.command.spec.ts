import { SignUp, SignUpHandler } from '@identity-and-access/use-cases/commands/signUp.command';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/inMemoryUser.repository';
import { BasicLoggerService } from '@common/logger/adapters/basicLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { Test } from '@nestjs/testing';
import { User } from '@identity-and-access/domain/entities/user';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/passwordHashing.service';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/uuidGenerator.service';

describe('[Unit] Sign up with credentials', () => {
  //Adapters
  let uuidGeneratorService: UUIDGeneratorService;
  let encryptionService: PasswordHashingService;
  let userRepository: InMemoryUserRepository;
  let logger: BasicLoggerService;

  //Use-case
  let signUpHandler: SignUpHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UUIDGeneratorService, PasswordHashingService, InMemoryUserRepository, BasicLoggerService],
    }).compile();

    uuidGeneratorService = moduleRef.get<UUIDGeneratorService>(UUIDGeneratorService);
    encryptionService = moduleRef.get<PasswordHashingService>(PasswordHashingService);
    userRepository = moduleRef.get<InMemoryUserRepository>(InMemoryUserRepository);
    logger = moduleRef.get<BasicLoggerService>(BasicLoggerService);

    signUpHandler = new SignUpHandler(uuidGeneratorService, encryptionService, userRepository, logger);
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

    await executeTask(userRepository.save(User.check({ id: uuidGeneratorService.generateUUID(), email: email, password: password })));

    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeTruthy();

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(1);
  });
});
