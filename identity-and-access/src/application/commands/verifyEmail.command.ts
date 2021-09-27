import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { executeTask } from "@common/utils/executeTask";
import { fromUnknown } from "@common/utils/fromUnknown";
import { noop } from "@common/utils/noop";
import { perform } from "@common/utils/perform";
import { UserId, verifyUserEmail } from "@identity-and-access/domain/entities/user";
import { IncorrectVerificationCodeException } from "@identity-and-access/domain/exceptions/incorrectVerificationCode.exception";
import { UserNotFoundException } from "@identity-and-access/domain/exceptions/userNotFound.exception";
import { VerificationCode4 } from "@identity-and-access/domain/value-objects/verificationCode4";
import { UserRepository } from "@identity-and-access/infrastructure/ports/user.repository";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { sequenceS, sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { chain, left, map, right, taskEither } from "fp-ts/lib/TaskEither";

export class VerifyEmail implements ICommand {
    constructor(public readonly userId: string, public readonly verificationCode: string) { }
}

@CommandHandler(VerifyEmail)
export class VerifyEmailHandler implements ICommandHandler {

    constructor(private readonly userRepository: UserRepository, private readonly logger: PinoLoggerService) {
        this.logger.setContext('VerifyEmail');
    }

    execute(command: VerifyEmail): Promise<void> {
        const task = pipe(
            sequenceS(taskEither)({
                userId: fromUnknown(command.userId, UserId, this.logger, 'user id'),
                verificationCode: fromUnknown(command.verificationCode, VerificationCode4, this.logger, 'verification code')
            }),
            chain((validatedDatas) =>
                sequenceT(taskEither)(perform(validatedDatas.userId, this.userRepository.getById, this.logger, 'get user by id'), right(validatedDatas))
            ),
            chain(([user, validatedDatas]) => {
                if (user == null)
                    return left(new UserNotFoundException());
                else if (validatedDatas.verificationCode != user.contactInformation.verificationCode)
                    return left(new IncorrectVerificationCodeException());
                else
                    return right(user)
            }),
            chain((user) => verifyUserEmail(user, this.logger)),
            chain((user) => perform(user, this.userRepository.save, this.logger, 'save user ')),
            map(noop)
        )
        return executeTask(task)
    }
}