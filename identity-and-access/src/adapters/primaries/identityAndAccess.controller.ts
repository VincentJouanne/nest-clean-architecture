import { CoreLogger } from '@core/logger/adapters/pinoLogger.service';
import { SignUp } from '@identity-and-access/use-cases/commands/signUp.command';
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class IdentityAndAccessController {
  constructor(private readonly commandBus: CommandBus, private readonly logger: CoreLogger) {}

  signUp = (email: string, password: string): TaskEither<Error, void> => {
    const signUpTask = tryCatch(
      async () => {
        const command = new SignUp(email, password);
        return await this.commandBus.execute<SignUp>(command);
      },
      (error: Error) => error,
    );

    return signUpTask;
  };
}
