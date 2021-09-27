import { FakeLoggerService } from "@common/logger/adapters/fake/FakeLogger.service";
import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { executeTask } from "@common/utils/executeTask";
import { VerifyEmail, VerifyEmailHandler } from "@identity-and-access/application/commands/verifyEmail.command";
import { IncorrectVerificationCodeException } from "@identity-and-access/domain/exceptions/incorrectVerificationCode.exception";
import { UserNotFoundException } from "@identity-and-access/domain/exceptions/userNotFound.exception";
import { FakeUserRepository } from "@identity-and-access/infrastructure/adapters/secondaries/fake/fakeUser.repository";
import { UserRepository } from "@identity-and-access/infrastructure/ports/user.repository";
import { UnprocessableEntityException } from "@nestjs/common/exceptions/unprocessable-entity.exception";
import { Test } from "@nestjs/testing/test";
import { UserBuilder } from "../data-builders/userBuilder";

let userRepository: FakeUserRepository;

describe('[Unit] Verify email with verification code', () => {
    let verifyEmailHandler: VerifyEmailHandler;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                VerifyEmailHandler,
                { provide: UserRepository, useClass: FakeUserRepository },
                { provide: PinoLoggerService, useClass: FakeLoggerService },
            ],
        }).compile();

        userRepository = moduleRef.get<UserRepository>(UserRepository) as FakeUserRepository;
        verifyEmailHandler = moduleRef.get<VerifyEmailHandler>(VerifyEmailHandler);

    })

    it('Should throw UnprocessableEntityException if user id is not correctly formatted', async () => {
        //When we verify email user
        const resultPromise = verifyEmailHandler.execute(new VerifyEmail('0', '1234'));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);
    })

    it('Should throw UnprocessableEntityException if verification code is not correctly formatted', async () => {
        //When we verify email user
        const resultPromise = verifyEmailHandler.execute(new VerifyEmail('00000000-0000-0000-0000-000000000000', '123'));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(UnprocessableEntityException);
    })


    it('Should throw UserNotFoundException if user does not exists', async () => {
        //Given an existing user
        const user = UserBuilder().build()
        await executeTask(userRepository.save(user));

        //When we verify email user
        const resultPromise = verifyEmailHandler.execute(new VerifyEmail('00000000-0000-0000-0000-000000000000', '1234'));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(UserNotFoundException);
    })

    it('Should throw IncorrectVerificationCodeException if verification code does not match', async () => {
        //Given an existing user
        const user = UserBuilder().withId('c017f4a9-c458-4ea7-829c-021c6a608534').withVerificationCode('1234').build()
        await executeTask(userRepository.save(user));

        //When we verify email user
        const resultPromise = verifyEmailHandler.execute(new VerifyEmail('c017f4a9-c458-4ea7-829c-021c6a608534', '0123'));

        //Then it should have thrown an error
        await expect(resultPromise).rejects.toBeInstanceOf(IncorrectVerificationCodeException);
    })

    it('Should succeed if verification code match', async () => {
        //Given an existing user
        const user = UserBuilder().withId('c017f4a9-c458-4ea7-829c-021c6a608534').withVerificationCode('1234').build()
        await executeTask(userRepository.save(user));

        //When we verify email user
        const result = await verifyEmailHandler.execute(new VerifyEmail('c017f4a9-c458-4ea7-829c-021c6a608534', '1234'));

        //Then it should verify its email
        expect(result).toBe(undefined)

        const users = await executeTask(userRepository.all());
        expect(users[0].contactInformation.isVerified).toBe(true);
    })
})