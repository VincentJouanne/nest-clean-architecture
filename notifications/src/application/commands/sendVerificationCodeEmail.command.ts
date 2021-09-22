import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { executeTask } from "@common/utils/executeTask";
import { fromUnknown } from "@common/utils/fromUnknown";
import { noop } from "@common/utils/noop";
import { perform } from "@common/utils/perform";
import { VerificationCode4 } from "@identity-and-access/domain/value-objects/verificationCode4";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { Email } from "@notifications/domain/value-objects/email";
import { VerificationCodeEmailPayload } from "@notifications/domain/value-objects/verificationCodeEmailPayload";
import { InMemoryMailService } from "@notifications/infrastructure/adapters/secondaries/fake/inMemoryMail.service";
import { pipe } from "fp-ts/lib/function";
import { chain, map } from "fp-ts/lib/TaskEither";

export class SendVerificationCodeEmail implements ICommand {
    constructor(
        public readonly email: Email, public readonly verificationCode: VerificationCode4) { }
}

@CommandHandler(SendVerificationCodeEmail)
export class SendVerificationCodeEmailHandler implements ICommandHandler {
    constructor(private readonly logger: PinoLoggerService, private mailService: InMemoryMailService) {
        this.logger.setContext('SendVerificationCodeEmail');
    }
    execute(command: SendVerificationCodeEmail): Promise<void> {
        const { email, verificationCode } = command;
        return executeTask(
            pipe(
            fromUnknown({to: email, verificationCode: verificationCode}, VerificationCodeEmailPayload, this.logger, 'verification code email payload'),
            chain((payload) => perform(payload, this.mailService.sendEmail, this.logger, 'send verification code email')), 
            map(noop)));
    }
}