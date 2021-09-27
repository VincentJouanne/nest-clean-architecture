import { AppModule } from "@app/api-gateway/app.module";
import { PrismaService } from "@common/prisma/adapters/prisma.service";
import { RealAuthenticationService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing/test";
import * as request from 'supertest';

let app: INestApplication;
let testingModule: TestingModule;
let authenticationService: RealAuthenticationService;
let prismaService: PrismaService;

beforeAll(async () => {
    testingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    authenticationService = testingModule.get<RealAuthenticationService>(RealAuthenticationService);
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


describe('[Feature] Authentication', () => {
    it('AAU, I should be able to authenticate myself', async () => {
        await request(app.getHttpServer()).post('/v1/auth/signup').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
        const signInResponse = await request(app.getHttpServer()).post('/v1/auth/signin').send({ email: 'myemail@gmail.com', password: 'Passw0rd!' });
        expect(signInResponse.status).toBe(200);
    })
})