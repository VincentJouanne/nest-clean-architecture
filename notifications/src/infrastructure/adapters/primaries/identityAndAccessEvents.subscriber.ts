import { executeTask } from "@common/utils/executeTask";
import { UserRegisteredEvent, USER_REGISTERED } from "@identity-and-access/domain/events/userRegistered.event";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { OnEvent } from "@nestjs/event-emitter";
import { SendVerificationCodeEmail } from "@notifications/application/commands/sendVerificationCodeEmail.command";
import { tryCatch } from "fp-ts/lib/TaskEither";

@Injectable()
export class IdentityAndAccessEventsSubscriber {
  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(USER_REGISTERED)
  async afterUserRegisteredEvent(payload: UserRegisteredEvent) {
    const task = tryCatch(
      async () => {
        const command = new SendVerificationCodeEmail(payload.email, payload.verificationCode);
        return await this.commandBus.execute<SendVerificationCodeEmail>(command);
      },
      (reason: unknown) => reason as Error,
    );

    executeTask(task);
  }
}