// Nest imports
import { Module, Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';

import { CoreLogger } from 'common/logger/src/adapters/pinoLogger.service';
import { LoggerModule } from 'common/logger/src/logger.module';
import { IdentityAndAccessModule } from '@identity-and-access/identityAndAccess.module';
import { IdentityAndAccessApiControllerV1 } from './api/v1/identityAndAccess.controller';

type NestModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;

// SubModule used by the server
const appModules: NestModuleImport[] = [LoggerModule, IdentityAndAccessModule];

// Infrastructure Modules (DB, config) used by the server
const infrastructureModules: NestModuleImport[] = [];

const controllers: any[] = [IdentityAndAccessApiControllerV1];

const queues: DynamicModule[] = [];

@Module({
  imports: [...appModules, ...infrastructureModules, ...queues],
  controllers: [...controllers],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly logger: CoreLogger) {}

  onModuleInit(): void {
    this.logger.setContext('AppModule');
  }
}
