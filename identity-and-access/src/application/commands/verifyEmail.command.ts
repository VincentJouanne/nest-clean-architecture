import { ICommand, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { executeTask } from "@common/utils/executeTask";
import { pipe } from "fp-ts/lib/function";
import { UserRepository } from "@identity-and-access/domain/repositories/user.repository";
import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { perform } from "@common/utils/perform";
import { noop } from "@common/utils/noop";
import { map, chain, left, right, taskEither } from "fp-ts/lib/TaskEither";
import { UserNotFoundException } from "@identity-and-access/domain/exceptions/userNotFound.exception";
import { User, UserId } from "@identity-and-access/domain/entities/user";
import { IncorrectVerificationCodeException } from "@identity-and-access/domain/exceptions/incorrectVerificationCode.exception";
import { fromUnknown } from "@common/utils/fromUnknown";
import { VerificationCode4 } from "@identity-and-access/domain/value-objects/verificationCode4";
import { sequenceS, sequenceT } from "fp-ts/lib/Apply";

export class VerifyEmail implements ICommand {
    constructor(public readonly userId: string, public readonly verificationCode: string) {}
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
                if(user == null)
                    return left(new UserNotFoundException());
                else if (validatedDatas.verificationCode != user.contactInformation.verificationCode)
                    return left(new IncorrectVerificationCodeException());
                else 
                    return right(user)
            }),
            chain((user) => 
                fromUnknown({...user, contactInformation: { ...user.contactInformation, isVerified: true }}, User, this.logger, 'user' )
            ),
            chain((user) => perform(user, this.userRepository.save, this.logger, 'save user ')),
            map(noop)
        )
        return executeTask(task)
    }
}