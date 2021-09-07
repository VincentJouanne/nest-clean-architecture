import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { FakeUserRepository } from '@identity-and-access/adapters/secondaries/fake/fakeUser.repository';
import { DefaultAuthenticationService } from '@identity-and-access/adapters/secondaries/real/defaultAuthentication.service';
import { DefaultHashingService } from '@identity-and-access/adapters/secondaries/real/defaultHashing.service';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { SignIn, SignInHandler } from '@identity-and-access/use-cases/commands/signIn.command';
import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

//Adapters
let userRepository: FakeUserRepository;
let hashingService: DefaultHashingService;

describe('[Unit] Sign in with credentials', () => {
  let signInHandler: SignInHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        SignInHandler,
        DefaultHashingService,
        DefaultAuthenticationService,
        { provide: UserRepository, useClass: FakeUserRepository },
        { provide: PinoLoggerService, useClass: FakeLoggerService },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository) as FakeUserRepository;
    hashingService = moduleRef.get<DefaultHashingService>(DefaultHashingService);
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
    await expect(resultPromise).rejects.toBeInstanceOf(NotFoundException);
  });

  it('Should throw ForbiddenException if the user exists but has not verified its email address', async () => {
    //Given valid credentials
    const email = 'myemail@gmail.com';
    const password = 'paSSw0rd!';
    await executeTask(
      userRepository.save(User.check({ id: 'c017f4a9-c458-4ea7-829c-021c6a608534', email: email, isVerified: false, password: password })),
    );

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('Should throw ForbiddenException if the user exists, is verified but has provided the wrong password', async () => {
    //Given valid credentials
    const email = 'myemail@gmail.com';
    const password = 'paSSw0rd!';
    const wrongPassword = 'paSSw0rd?';
    const hashedPassword = await executeTask(hashingService.hashPlainPassword(PlainPassword.check(wrongPassword)));
    await executeTask(
      userRepository.save(User.check({ id: 'c017f4a9-c458-4ea7-829c-021c6a608534', email: email, isVerified: true, password: hashedPassword })),
    );

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('Should issue a JWT if the user exists, is verified and has provided the correct credentials', async () => {
    //Given valid credentials
    const email = 'myemail@gmail.com';
    const password = 'paSSw0rd!';
    const hashedPassword = await executeTask(hashingService.hashPlainPassword(PlainPassword.check(password)));

    await executeTask(
      userRepository.save(User.check({ id: 'c017f4a9-c458-4ea7-829c-021c6a608534', email: email, isVerified: true, password: hashedPassword })),
    );

    //When we sign in a user
    const resultPromise = signInHandler.execute(new SignIn(email, password));

    //Then it should have thrown an error
    await expect(resultPromise).resolves.toBeTruthy();
  });
});
