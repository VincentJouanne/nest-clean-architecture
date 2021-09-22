import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { executeTask } from '@common/utils/executeTask';
import { User } from '@identity-and-access/domain/entities/user';
import { ContactInformation } from '@identity-and-access/domain/value-objects/contactInformation';
import { RealUserRepository } from '@identity-and-access/infrastructure/adapters/secondaries/real/realUser.repository';
import { Test } from '@nestjs/testing';
import { Email } from '@notifications/domain/value-objects/email';

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
  await prismaService.contactInformation.deleteMany();
});

afterEach(async () => {
  await prismaService.user.deleteMany();
  await prismaService.contactInformation.deleteMany();
});

describe('[Integration] User repository', () => {
  it('Successfully get user by email', async () => {
    //Given an existing user in database
    const email = Email.check('myemail@gmail.com');

    const user = User.check({
      id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      password: 'Passw0rd!',
      contactInformation: ContactInformation.check({
        email: email,
        verificationCode: '1234',
        isVerified: true,
      }),
    });

    await prismaService.user.create({
      data: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
        password: 'Passw0rd!',
        contactInformation: {
          create: {
            email: email,
            verificationCode: '1234',
            isVerified: true,
          },
        },
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
      password: 'Passw0rd!',
      contactInformation: ContactInformation.check({
        email: 'myemail@gmail.com',
        verificationCode: '1234',
        isVerified: true,
      }),
    });

    //When we save him
    await executeTask(userRepository.save(user));

    //Then we should have saved him
    const savedUser = await prismaService.user.findUnique({
      where: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      },
      include: {
        contactInformation: true,
      },
    });

    return expect(savedUser).toStrictEqual({
      id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
      password: 'Passw0rd!',
      contactInformationId: 'myemail@gmail.com',
      contactInformation: {
        email: 'myemail@gmail.com',
        isVerified: true,
        verificationCode: '1234',
      },
    });
  });
});
