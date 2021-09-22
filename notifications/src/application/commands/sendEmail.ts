import { PinoLoggerService } from "@common/logger/adapters/real/pinoLogger.service";
import { executeTask } from "@common/utils/executeTask";
import { noop } from "@common/utils/noop";
import { perform } from "@common/utils/perform";
import { UserRegisteredEvent } from "@identity-and-access/domain/events/userRegistered.event";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { InMemoryMailService } from "@notifications/infrastructure/adapters/secondaries/fake/inMemoryMail.service";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";

export class SendEmail implements ICommand {
    constructor(
        public readonly payload: UserRegisteredEvent) { }
}

@CommandHandler(SendEmail)
export class SendEmailHandler implements ICommandHandler {
    constructor(private readonly logger: PinoLoggerService, private mailService: InMemoryMailService) {
        this.logger.setContext('SendEmail');
    }
    execute(command: SendEmail): Promise<void> {
        const { payload } = command;
        return executeTask(pipe(perform(payload.email, this.mailService.sendEmail, this.logger, 'send verification email'), map(noop)));
    }
}