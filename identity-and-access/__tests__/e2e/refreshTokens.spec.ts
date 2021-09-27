import { AppModule } from "@app/api-gateway/app.module";
import { executeTask } from "@common/utils/executeTask";
import { RealAuthenticationService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing/test";
import * as request from 'supertest';
import { UserBuilder } from "../data-builders/userBuilder";

let app: INestApplication;
let testingModule: TestingModule;
let authenticationService: RealAuthenticationService;
let refreshToken: string;

beforeAll(async () => {
    testingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    authenticationService = testingModule.get<RealAuthenticationService>(RealAuthenticationService);

    app = testingModule.createNestApplication();
    await app.init();
});

afterAll(async () => {
    await app.close();
});

beforeEach(async () => {
    const user = UserBuilder().withId('c017f4a9-c458-4ea7-829c-021c6a608534').build()
    const tokens = await executeTask(authenticationService.createAuthenticationTokens(user.id))
    refreshToken = tokens[1]
});

describe('[e2e] POST /v1/auth/refresh', () => {
    it('Should respond 401 for invalid token request', async () => {
        const response = await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refresh_token: 'abc' });
        expect(response.status).toBe(401);
    });

    it('Should respond 200 for valid token request', async () => {
        const response = await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refresh_token: refreshToken });
        expect(response.status).toBe(200);
    });
})