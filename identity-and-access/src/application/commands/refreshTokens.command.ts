import { LOGGER } from '@common/logger/logger.module';
import { executeTask } from '@common/utils/executeTask';
import { fromUnknown } from '@common/utils/fromUnknown';
import { perform } from '@common/utils/perform';
import { UserId } from '@identity-and-access/domain/entities/user';
import { AccessToken } from '@identity-and-access/domain/value-objects/accessToken';
import { RefreshToken } from '@identity-and-access/domain/value-objects/refreshToken';
import { RealAuthenticationService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service';
import { ConsoleLogger, Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { pipe } from 'fp-ts/lib/function';
import { chain, right } from 'fp-ts/lib/TaskEither';

export class RefreshTokens implements ICommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokens)
export class RefreshTokensHandler implements ICommandHandler {
  constructor(
    public readonly authenticationService: RealAuthenticationService,
    @Inject(LOGGER)
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext('RefreshTokens');
  }

  execute(command: RefreshTokens): Promise<[AccessToken, RefreshToken]> {
    const { refreshToken } = command;
    const task = pipe(
      right(refreshToken),
      chain(this.authenticationService.verifyIntegrityAndAuthenticityOfRefreshToken),
      chain((decodedToken) => fromUnknown(decodedToken, UserId, this.logger, 'user id')),
      chain((userId) => perform(userId, this.authenticationService.createAuthenticationTokens, this.logger, 'refresh authentication tokens')),
    );

    return executeTask(task);
  }
}
