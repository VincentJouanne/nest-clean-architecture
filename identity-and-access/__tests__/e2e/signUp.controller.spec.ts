import { AppModule } from '@app/api-gateway/app.module';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

let app: INestApplication;
let prismaService: PrismaService;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  prismaService = module.get<PrismaService>(PrismaService);
  app = module.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await prismaService.user.deleteMany();
});

afterEach(async () => {
  await prismaService.user.deleteMany();
});

describe('[e2e] POST /v1/signup', () => {
  it('OK - Should respond 201 created for a valid email and password', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    const userCreated = await prismaService.user.findFirst({
      where: {
        email: 'myemail@gmail.com',
      },
    });
    expect(response.status).toBe(201);
    expect(userCreated).toBeDefined();
  });

  it('KO - Should respond 422 for invalid email', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signup').send({ email: 'myemail', password: 'Passw0rd!' });
    const userCreated = await prismaService.user.findFirst({
      where: {
        email: 'myemail',
      },
    });
    expect(response.status).toBe(422);
    expect(userCreated).toBe(null);
  });

  it('KO - Should respond 422 for invalid password', async () => {
    const response = await request(app.getHttpServer()).post('/v1/signup').send({ email: 'myemail', password: 'toosimple' });
    const userCreated = await prismaService.user.findFirst({
      where: {
        email: 'myemail',
      },
    });
    expect(response.status).toBe(422);
    expect(userCreated).toBe(null);
  });

  it('KO - Should respond 409 for two users with same email', async () => {
    await request(app.getHttpServer()).post('/v1/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    const response = await request(app.getHttpServer()).post('/v1/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
    const userCreated = await prismaService.user.findFirst({
      where: {
        email: 'myemail',
      },
    });
    expect(response.status).toBe(409);
    expect(userCreated).toBe(null);
  });
});
