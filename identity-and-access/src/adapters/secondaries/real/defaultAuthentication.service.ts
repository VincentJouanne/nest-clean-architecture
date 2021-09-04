import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { AuthenticationService } from '@identity-and-access/domain/services/authentication.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  constructor(private logger: PinoLoggerService) {
    this.logger.setContext('AuthenticationService');
  }
}
