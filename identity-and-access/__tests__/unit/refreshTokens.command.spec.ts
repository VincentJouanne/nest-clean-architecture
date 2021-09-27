import { FakeLoggerService } from "@common/logger/adapters/fake/FakeLogger.service";
import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { executeTask } from "@common/utils/executeTask";
import { RefreshTokens, RefreshTokensHandler } from "@identity-and-access/application/commands/refreshTokens.command";
import { InvalidTokenException } from "@identity-and-access/domain/exceptions/invalidToken.exception";
import { RealAuthenticationService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UserBuilder } from "../data-builders/userBuilder";

describe('[Unit] Refresh authentication tokens', () => {
    let refreshTokensHandler: RefreshTokensHandler;
    let authenticationService: RealAuthenticationService;


    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [JwtModule.register({
                signOptions: { expiresIn: '15m' },
            })],
            providers: [
                RefreshTokensHandler,
                RealAuthenticationService,
                { provide: PinoLoggerService, useClass: FakeLoggerService },
            ],
        }).compile();

        refreshTokensHandler = moduleRef.get<RefreshTokensHandler>(RefreshTokensHandler)
        authenticationService = moduleRef.get<RealAuthenticationService>(RealAuthenticationService);

    })

    it('Should throw InvalidTokenException if token is wrongly formatted', async () => {
        //When we refresh tokens with an invalid refresh token
        const resultPromise = refreshTokensHandler.execute(new RefreshTokens('abc'));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(InvalidTokenException);
    });

    it('Should throw InvalidTokenException if token is correctly formatted but not signed by the server', async () => {
        const unknownJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        //When we refresh tokens with an invalid refresh token
        const resultPromise = refreshTokensHandler.execute(new RefreshTokens(unknownJWT));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(InvalidTokenException);
    });

    it('Should succeed if token provided is signed by the secret key', async () => {
        //Given a user and valid authentication tokens
        const user = UserBuilder().build()
        const tokens = await executeTask(authenticationService.createAuthenticationTokens(user.id))

        //When we refresh tokens with a valid refresh token
        const result = await refreshTokensHandler.execute(new RefreshTokens(tokens[1]));

        //Then it should have succeeded
        expect(result).toBeDefined();
    });
})