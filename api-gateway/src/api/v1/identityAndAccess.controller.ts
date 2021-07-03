import { CoreLogger } from '@core/logger/adapters/pinoLogger.service';
import { IdentityAndAccessController } from '@modules/identity-and-access/adapters/primaries/identityAndAccess.controller';
import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { executeTask } from '@shared/utils/executeTask';

@Controller('v1')
@ApiTags('Identity and access')
export class IdentityAndAccessApiControllerV1 {
  constructor(private readonly identityAndAccessController: IdentityAndAccessController, private readonly logger: CoreLogger) {}

  @Post('signup')
  async signUp(): Promise<void> {
    await executeTask(this.identityAndAccessController.signUp('', ''));
  }
}
