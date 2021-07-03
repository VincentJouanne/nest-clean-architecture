import { Module } from '@nestjs/common';
import { IdentityAndAccessAdaptersModule } from './adapters/identityAndAccess.adapters.module';
import { IdentityAndAccessController } from './adapters/primaries/identityAndAccess.controller';
import { IdentityAndAccessUseCasesModule } from './use-cases/identityAndAccess.usecases';

@Module({
  imports: [IdentityAndAccessAdaptersModule, IdentityAndAccessUseCasesModule],
  providers: [IdentityAndAccessController],
  exports: [IdentityAndAccessController],
})
export class IdentityAndAccessModule {}
