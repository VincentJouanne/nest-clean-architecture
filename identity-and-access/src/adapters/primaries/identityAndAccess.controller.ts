import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { JWT } from '@identity-and-access/domain/value-objects/jwt';
import { SignIn } from '@identity-and-access/use-cases/commands/signIn.command';
import { SignUp } from '@identity-and-access/use-cases/commands/signUp.command';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class IdentityAndAccessController {
  constructor(private readonly commandBus: CommandBus, private readonly logger: PinoLoggerService) {}

  signUp = (email: string, password: string): TaskEither<Error, void> => {
    const signUpTask = tryCatch(
      async () => {
        const command = new SignUp(email, password);
        return await this.commandBus.execute<SignUp>(command);
      },
      (reason: unknown) => reason as Error,
    );

    return signUpTask;
  };

  signIn = (email: string, password: string): TaskEither<Error, JWT> => {
    const signInTask = tryCatch(
      async () => {
        const command = new SignIn(email, password);
        return await this.commandBus.execute<SignUp>(command);
      },
      (reason: unknown) => reason as Error,
    );

    return signInTask;
  };
}
