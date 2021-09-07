import { AppModule } from '@app/api-gateway/app.module';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { executeTask } from '@common/utils/executeTask';
import { DefaultHashingService } from '@identity-and-access/adapters/secondaries/real/defaultHashing.service';
import { PlainPassword } from '@identity-and-access/domain/value-objects/password';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
let app: INestApplication;
let testingModule: TestingModule;
let prismaService: PrismaService;
let hashingService: DefaultHashingService;

beforeAll(async () => {
  testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PinoLoggerService)
    .useClass(FakeLoggerService)
    .compile();

  prismaService = testingModule.get<PrismaService>(PrismaService);
  hashingService = testingModule.get<DefaultHashingService>(DefaultHashingService);

  app = testingModule.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
  await prismaService.$disconnect();
});

beforeEach(async () => {
  await prismaService.user.deleteMany();
});

afterEach(async () => {
  await prismaService.user.deleteMany();
});

describe('[e2e] POST /v1/signin', () => {
  it('Should respond 422 for invalid email', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail', password: 'Passw0rd!' });
    expect(response.status).toBe(422);
  });

  it('Should respond 422 for invalid password', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail', password: 'toosimple' });
    expect(response.status).toBe(422);
  });

  it('Should respond 404 for inexisting user', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    expect(response.status).toBe(404);
  });

  it('Should respond 403 for existing user but unverified email', async () => {
    await prismaService.user.create({
      data: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
        email: 'myemail@gmail.com',
        is_verified: false,
        password: 'Passw0rd!',
      },
    });

    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    expect(response.status).toBe(403);
  });

  it('Should respond 403 for existing user, verified email but wrong password', async () => {
    await prismaService.user.create({
      data: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
        email: 'myemail@gmail.com',
        is_verified: true,
        password: 'Passw0rd!',
      },
    });

    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail@gmail.com', password: 'Passw0rd?' });
    expect(response.status).toBe(403);
  });

  it('Should respond 200 for existing user, verified email but wrong password', async () => {
    const hashedPassword = await executeTask(hashingService.hashPlainPassword(PlainPassword.check('Passw0rd!')));

    await prismaService.user.create({
      data: {
        id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
        email: 'myemail@gmail.com',
        is_verified: true,
        password: hashedPassword,
      },
    });

    const response = await request(app.getHttpServer()).post('/v1/signin').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
  });
});
