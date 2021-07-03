import { SignUp, SignUpHandler } from '@modules/identity-and-access/use-cases/commands/signUp.command';
import { InMemoryTagGeneratorService } from '@modules/identity-and-access/adapters/inMemoryTagGenerator.service';
import { InMemoryUserRepository } from '@modules/identity-and-access/adapters/inMemoryUser.repository';
import { BasicLoggerService } from '@core/logger/adapters/basicLogger.service';
import { executeTask } from '@shared/utils/executeTask';
import { Test } from '@nestjs/testing';
import { User } from '@modules/identity-and-access/domain/user';
import { PasswordHashingService } from '@modules/identity-and-access/adapters/passwordHashing.service';
import { UUIDGeneratorService } from '@modules/identity-and-access/adapters/uuidGenerator.service';

describe('[Unit] Sign up with credentials', () => {
  //Adapters
  let uuidGeneratorService: UUIDGeneratorService;
  let tagGeneratorService: InMemoryTagGeneratorService;
  let encryptionService: PasswordHashingService;
  let userRepository: InMemoryUserRepository;
  let logger: BasicLoggerService;

  //Use-case
  let signUpHandler: SignUpHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UUIDGeneratorService, InMemoryTagGeneratorService, PasswordHashingService, InMemoryUserRepository, BasicLoggerService],
    }).compile();

    uuidGeneratorService = moduleRef.get<UUIDGeneratorService>(UUIDGeneratorService);
    tagGeneratorService = moduleRef.get<InMemoryTagGeneratorService>(InMemoryTagGeneratorService);
    encryptionService = moduleRef.get<PasswordHashingService>(PasswordHashingService);
    userRepository = moduleRef.get<InMemoryUserRepository>(InMemoryUserRepository);
    logger = moduleRef.get<BasicLoggerService>(BasicLoggerService);

    signUpHandler = new SignUpHandler(uuidGeneratorService, tagGeneratorService, encryptionService, userRepository, logger);
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
    //Given a potentially invalid email
    const email = 'abc123';
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

    await executeTask(
      userRepository.save(
        User.check({ id: uuidGeneratorService.generateUUID(), tag: tagGeneratorService.generateTag6(), email: email, password: password }),
      ),
    );

    //When we create a user
    const resultPromise = signUpHandler.execute(new SignUp(email, password));

    //Then it should have thrown an error and not have created a user
    await expect(resultPromise).rejects.toBeTruthy();

    const users = await executeTask(userRepository.all());
    expect(users.length).toEqual(1);
  });
});
