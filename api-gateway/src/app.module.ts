// Nest imports
import { Module, Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';

import { CoreLogger } from 'modules/core/logger/src/logger.service';
import { LoggerModule } from 'modules/core/logger/src/logger.module';

type NestModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;

// SubModule used by the server
const appModules: NestModuleImport[] = [LoggerModule];

// Infrastructure Modules (DB, config) used by the server
const infrastructureModules: NestModuleImport[] = [];

const controllers: any[] = [];

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
