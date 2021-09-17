import { ICommand, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { executeTask } from "@common/utils/executeTask";
import { pipe } from "fp-ts/lib/function";
import { UserRepository } from "@identity-and-access/domain/repositories/user.repository";
import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { perform } from "@common/utils/perform";
import { noop } from "@common/utils/noop";
import { map, chain, left, right } from "fp-ts/lib/TaskEither";
import { UserNotFoundException } from "@identity-and-access/domain/exceptions/userNotFound.exception";
import { User } from "@identity-and-access/domain/entities/user";
import { IncorrectVerificationCodeException } from "@identity-and-access/domain/exceptions/incorrectVerificationCode.exception";
import { fromUnknown } from "@common/utils/fromUnknown";

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
            perform(command.userId, this.userRepository.getById, this.logger, 'get user by id'),
            chain((user) => {
                if(user == null)
                    return left(new UserNotFoundException());
                else if (command.verificationCode != user.contactInformations.verificationCode)
                    return left(new IncorrectVerificationCodeException());
                else 
                    return right(user)
            }),
            chain((user) => 
                fromUnknown({...user, contactInformations: { ...user.contactInformations, isVerified: true }}, User, this.logger, 'user' )
            ),
            chain((user) => perform(user, this.userRepository.save, this.logger, 'save user ')),
            map(noop)
        )
        return executeTask(task)
    }
}