import { AppModule } from '@app/api-gateway/app.module';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
let app: INestApplication;
let testingModule: TestingModule;
let prismaService: PrismaService;

beforeAll(async () => {
  testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PinoLoggerService)
    .useClass(FakeLoggerService)
    .compile();

  prismaService = testingModule.get<PrismaService>(PrismaService);
  app = testingModule.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
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

describe('[e2e] POST /v1/auth/signup', () => {
  it('Should respond 201 created for a valid email and password', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    expect(response.status).toBe(201);
  });

  it('Should respond 422 for invalid email', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail', password: 'Passw0rd!' });
    expect(response.status).toBe(422);
  });

  it('Should respond 422 for invalid password', async () => {
    const response = await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail', password: 'toosimple' });
    expect(response.status).toBe(422);
  });

  it('Should respond 409 for two users with same email', async () => {
    await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    const response = await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    expect(response.status).toBe(409);
  });
});
