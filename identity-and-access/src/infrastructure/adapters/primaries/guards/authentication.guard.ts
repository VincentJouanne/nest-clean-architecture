import { LOGGER } from '@common/logger/logger.module';
import { executeAndHandle } from '@common/utils/executeTask';
import { RealAuthenticationService } from '@identity-and-access/infrastructure/adapters/secondaries/real/realAuthentication.service';
import { CanActivate, ConsoleLogger, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { chain, right } from 'fp-ts/lib/TaskEither';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly authenticationService: RealAuthenticationService,
    @Inject(LOGGER)
    private readonly logger: ConsoleLogger,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('Received a request to authenticate.');
    const request = context.switchToHttp().getRequest<Request>();
    const task = pipe(
      right(request),
      chain(this.authenticationService.extractAuthorizationHeaderFromRequest),
      chain(this.authenticationService.extractBearerTokenFromAuthorizationHeader),
      chain(this.authenticationService.verifyIntegrityAndAuthenticityOfAccessToken),
    );

    return executeAndHandle(
      task,
      (error) => {
        console.log(error);
        throw error;
      },
      () => {
        this.logger.log('Successfully authenticated user.');
        return true;
      },
    );
  }
}
