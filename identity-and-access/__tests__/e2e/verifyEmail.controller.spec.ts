import { AppModule } from "@app/api-gateway/app.module";
import { PrismaService } from "@common/prisma/adapters/prisma.service";
import { executeTask } from "@common/utils/executeTask";
import { RealAuthenticationService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing/test";
import * as request from 'supertest';
import { UserBuilder } from "../data-builders/userBuilder";

let app: INestApplication;
let testingModule: TestingModule;
let prismaService: PrismaService;
let authenticationService: RealAuthenticationService;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
    testingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    prismaService = testingModule.get<PrismaService>(PrismaService);
    authenticationService = testingModule.get<RealAuthenticationService>(RealAuthenticationService);

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
    const user = UserBuilder().withId('c017f4a9-c458-4ea7-829c-021c6a608534').build()
    const tokens = await executeTask(authenticationService.createAuthenticationTokens(user.id))
    accessToken = tokens[0]
    refreshToken = tokens[1]
});

afterEach(async () => {
    await prismaService.user.deleteMany();
    await prismaService.contactInformation.deleteMany();
});

describe('[e2e] PATCH /v1/users/{:userId}/contact-information', () => {
    it('Should respond 401 for unauthenticated request', async () => {
        const response = await request(app.getHttpServer()).patch('/v1/users/1/contact-information/email').send({ verification_code: '1234' });
        expect(response.status).toBe(401);
    });

    it('Should respond 422 for invalid userId format', async () => {
        const response = await request(app.getHttpServer()).patch('/v1/users/1/contact-information/email').send({ verification_code: '1234' }).set({ 'Authorization': `Bearer ${accessToken}` });
        expect(response.status).toBe(422);
    });

    it('Should respond 422 for invalid verification code format', async () => {
        const response = await request(app.getHttpServer()).patch('/v1/users/c017f4a9-c458-4ea7-829c-021c6a608534/contact-information/email').send({ verification_code: '1' }).set({ 'Authorization': `Bearer ${accessToken}` });
        expect(response.status).toBe(422);
    });

    it('Should respond 404 if user does not exists', async () => {
        await prismaService.user.create({
            data: {
                id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
                password: 'Passw0rd!',
                contactInformation: {
                    create: {
                        email: 'myemail@gmail.com',
                        verificationCode: '1234',
                        isVerified: false,
                    },
                },
            },
        });

        const response = await request(app.getHttpServer()).patch('/v1/users/a017f4a9-c458-4ea7-829c-021c6a608534/contact-information/email').send({ verification_code: '1234' }).set({ 'Authorization': `Bearer ${accessToken}` });
        expect(response.status).toBe(404);
    })

    it('Should respond 401 if verification codes does not match', async () => {
        await prismaService.user.create({
            data: {
                id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
                password: 'Passw0rd!',
                contactInformation: {
                    create: {
                        email: 'myemail@gmail.com',
                        verificationCode: '1234',
                        isVerified: false,
                    },
                },
            },
        });

        const response = await request(app.getHttpServer()).patch('/v1/users/c017f4a9-c458-4ea7-829c-021c6a608534/contact-information/email').send({ verification_code: '1111' }).set({ 'Authorization': `Bearer ${accessToken}` });
        expect(response.status).toBe(401);
    })


    it('Should respond 200 for a valid verification code', async () => {
        await prismaService.user.create({
            data: {
                id: 'c017f4a9-c458-4ea7-829c-021c6a608534',
                password: 'Passw0rd!',
                contactInformation: {
                    create: {
                        email: 'myemail@gmail.com',
                        verificationCode: '1234',
                        isVerified: false,
                    },
                },
            },
        });

        const response = await request(app.getHttpServer()).patch('/v1/users/c017f4a9-c458-4ea7-829c-021c6a608534/contact-information/email').send({ verification_code: '1234' }).set({ 'Authorization': `Bearer ${accessToken}` });
        const user = await prismaService.user.findUnique({
            where: { id: 'c017f4a9-c458-4ea7-829c-021c6a608534' }, include: {
                contactInformation: true
            }
        })
        expect(response.status).toBe(200);
        expect(user?.contactInformation.isVerified).toBe(true);

    })
})