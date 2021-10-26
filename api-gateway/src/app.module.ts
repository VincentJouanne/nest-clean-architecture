// Nest imports

import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { PrismaModule } from '@common/prisma/prisma.module';
import { DynamicModule, ForwardReference, Module, OnModuleInit, Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CallIdentificationModule } from '../../call-identification/src/callIdentification.module';
import { CallsController } from '../../call-identification/src/infrastructure/adapters/primaries/controllers/calls.controller';

type NestModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;

// SubModule used by the server
const appModules: NestModuleImport[] = [CqrsModule, LoggerModule, PrismaModule, CallIdentificationModule];

// Infrastructure Modules (DB, config) used by the server
const infrastructureModules: NestModuleImport[] = [];

const controllers = [CallsController];

const queues: DynamicModule[] = [];

@Module({
  imports: [...appModules, ...infrastructureModules, ...queues],
  controllers: [...controllers],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly logger: PinoLoggerService) {}

  onModuleInit(): void {
    this.logger.setContext('AppModule');
  }
}
