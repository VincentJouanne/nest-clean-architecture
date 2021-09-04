import { Email } from '@common/mail/domain/value-objects/email';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { executeTask } from '@common/utils/executeTask';
import { RealUserRepository } from '@identity-and-access/adapters/secondaries/real/realUser.repository';
import { User } from '@identity-and-access/domain/entities/user';
import { Test } from '@nestjs/testing';

let prismaService: PrismaService;
let userRepository: RealUserRepository;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    providers: [RealUserRepository, PrismaService],
  }).compile();

  userRepository = module.get<RealUserRepository>(RealUserRepository);
  prismaService = module.get<PrismaService>(PrismaService);
});

afterAll(async () => {
  await prismaService.$disconnect();
});

beforeEach(async () => {
  await prismaService.user.deleteMany();
});

afterEach(async () => {
  await prismaService.user.deleteMany();
});

describe('[Integration] User repository', () => {
  it('Successfully get user by email', async () => {
    //Given an existing user in database
    const email = Email.check('myemail@gmail.com');

    const user = User.check({
      id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      email: email,
      isVerified: true,
      password: 'Passw0rd!',
    });

    await prismaService.user.create({
      data: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
        email: email,
        is_verified_email: true,
        password: 'Passw0rd!',
      },
    });

    //When we retrieve him by email
    const savedUser = await executeTask(userRepository.getByEmail(email));

    //Then we should have retrieved him
    return expect(savedUser).toEqual(user);
  });

  it('Fails to get user by email', async () => {
    //Given an existing user in database
    const email = Email.check('myemail@gmail.com');

    //When we retrieve him by email
    const savedUser = await executeTask(userRepository.getByEmail(email));

    //Then we should have retrieved him
    return expect(savedUser).toBe(null);
  });

  it('Successfully save user', async () => {
    //Given an inexisting user in database
    const user = User.check({
      id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      email: 'myemail@gmail.com',
      isVerified: true,
      password: 'Passw0rd!',
    });

    //When we save him
    await executeTask(userRepository.save(user));

    //Then we should have saved him
    const savedUser = await prismaService.user.findUnique({
      where: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      },
    });

    return expect(savedUser).toEqual({
      id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      email: 'myemail@gmail.com',
      is_verified_email: true,
      password: 'Passw0rd!',
    });
  });
});
