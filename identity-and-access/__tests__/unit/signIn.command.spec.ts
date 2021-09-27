import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { SignIn, SignInHandler } from '@identity-and-access/application/commands/signIn.command';
import { IncorrectPasswordException } from '@identity-and-access/domain/exceptions/incorrectPassword.exception';
import { UserNotFoundException } from '@identity-and-access/domain/exceptions/userNotFound.exception';
import { FakeUserRepository } from '@identity-and-access/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { RealAuthenticationService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service';
import { RealHashingService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realHashing.service';
import { RealRandomNumberGenerator } from '@identity-and-access/infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { UserRepository } from '@identity-and-access/infrastructure/ports/user.repository';
import { UnprocessableEntityException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PasswordBuilder } from '../data-builders/passwordBuilder';
import { UserBuilder } from '../data-builders/userBuilder';

//Adapters
let userRepository: FakeUserRepository;
let hashingService: RealHashingService;

describe('[Unit] Sign in with credentials', () => {
  let signInHandler: SignInHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({
        signOptions: { expiresIn: '15m' },
      })],
      providers: [
        SignInHandler,
        RealRandomNumberGenerator,
        RealHashingService,
        RealAuthenticationService,
        { provide: UserRepository, useClass: FakeUserRepository },
        { provide: PinoLoggerService, useClass: FakeLoggerService },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository) as FakeUserRepository;
    hashingService = moduleRef.get<RealHashingService>(RealHashingService);
    signInHandler = moduleRef.get<SignInHandler>(SignInHandler);
  });
  it('Should throw UnprocessableEntityException if email is invalid', async () => {
    //Given an invalid email
    const email = 'invalidmail';
    const password = 'paSSw0rd!';

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('Should throw UnprocessableEntityException if password is invalid', async () => {
    //Given an invalid password
    const email = 'myemail@gmail.com';
    const password = 'toosimple';

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('Should throw NotFoundException if no user exists for a given email address', async () => {
    //Given valid credentials
    const email = 'myemail@gmail.com';
    const password = 'paSSw0rd!';

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('Should throw ForbiddenException if the user exists but has provided the wrong password', async () => {
    //Given valid credentials
    const expectedPassword = 'paSSw0rd!';
    const hashedPassword = await PasswordBuilder(hashingService, expectedPassword).build()
    const user = UserBuilder().withEmail('myemail@gmail.com').withHashedPassword(hashedPassword).build();
    await executeTask(userRepository.save(user));
    const aDifferentPassword = 'paSSw0rd?';

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn('myemail@gmail.com', aDifferentPassword));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(IncorrectPasswordException);
  });

  it('Should issue a JWT if the user exists and has provided the correct credentials', async () => {
    //Given valid credentials
    const validEmail = 'myemail@gmail.com'
    const validPassword = 'paSSw0rd!'
    const hashedPassword = await PasswordBuilder(hashingService, validPassword).build()
    const user = UserBuilder().withEmail(validEmail).withHashedPassword(hashedPassword).build();
    await executeTask(userRepository.save(user));

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(validEmail, validPassword));

    //Then it should have thrown an error
    await expect(resultPromise).resolves.toBeTruthy();
  });
});
