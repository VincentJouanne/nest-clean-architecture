import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityAndAccessController } from './adapters/primaries/identityAndAccess.controller';
import { IdentityAndAccessUseCasesModule } from './use-cases/identityAndAccess.usecases';

@Module({
  imports: [CqrsModule, IdentityAndAccessUseCasesModule],
  providers: [IdentityAndAccessController],
  exports: [IdentityAndAccessController],
})
export class IdentityAndAccessModule {}
