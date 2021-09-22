import { SendEmail } from "@common/mail/application/commands/sendEmail";
import { executeTask } from "@common/utils/executeTask";
import { UserCreatedEvent, USER_CREATED } from "@identity-and-access/domain/events/userCreated.event";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { OnEvent } from "@nestjs/event-emitter";
import { tryCatch } from "fp-ts/lib/TaskEither";

@Injectable()
export class IdentityAndAccessEventsSubscriber {
  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(USER_CREATED)
  async handleUserCreatedEvent(payload: UserCreatedEvent) {
    const task = tryCatch(
      async () => {
        const command = new SendEmail(payload);
        return await this.commandBus.execute<SendEmail>(command);
      },
      (reason: unknown) => reason as Error,
    );

    executeTask(task);
  }
}