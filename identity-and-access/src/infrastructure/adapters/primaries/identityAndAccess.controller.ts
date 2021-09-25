import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { RefreshTokens } from '@identity-and-access/application/commands/refreshTokens.command';
import { SignIn } from '@identity-and-access/application/commands/signIn.command';
import { SignUp } from '@identity-and-access/application/commands/signUp.command';
import { VerifyEmail } from '@identity-and-access/application/commands/verifyEmail.command';
import { AccessToken } from '@identity-and-access/domain/value-objects/accessToken';
import { RefreshToken } from '@identity-and-access/domain/value-objects/refreshToken';
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

  signIn = (email: string, password: string): TaskEither<Error, [AccessToken, RefreshToken]> => {
    const signInTask = tryCatch(
      async () => {
        const command = new SignIn(email, password);
        return await this.commandBus.execute<SignIn>(command);
      },
      (reason: unknown) => reason as Error,
    );

    return signInTask;
  };

  refreshTokens = (refreshToken: string): TaskEither<Error, [AccessToken, RefreshToken]> => { 
    const refreshTokensTask = tryCatch(
      async () => {
        const command = new RefreshTokens(refreshToken);
        return await this.commandBus.execute<RefreshTokens>(command);
      },
      (reason: unknown) => reason as Error,
    )

    return refreshTokensTask
  }

  verifyEmail = (userId: string, verificationCode: string): TaskEither<Error, void> => {
    const verifyEmailTask = tryCatch(
      async () => {
        const command = new VerifyEmail(userId, verificationCode);
        return await this.commandBus.execute<VerifyEmail>(command);
      },
      (reason: unknown) => reason as Error,
    )

    return verifyEmailTask
  }
}
