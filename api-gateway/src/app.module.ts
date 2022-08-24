// Nest imports
import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { LOGGER, LoggerModule } from '@common/logger/logger.module';
import { PrismaModule } from '@common/prisma/prisma.module';
import { IdentityAndAccessModule } from '@identity-and-access/identityAndAccess.module';
import { AuthenticationController } from '@identity-and-access/infrastructure/adapters/primaries/controllers/authentication.controller';
import { UsersController } from '@identity-and-access/infrastructure/adapters/primaries/controllers/users.controller';
import { ConsoleLogger, DynamicModule, ForwardReference, Inject, Module, OnModuleInit, Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsModule } from '@notifications/notifications.module';

type NestModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;

// SubModule used by the server
const appModules: NestModuleImport[] = [
  CqrsModule,
  LoggerModule,
  DomainEventPublisherModule,
  NotificationsModule,
  PrismaModule,
  IdentityAndAccessModule,
];

// Infrastructure Modules (DB, config) used by the server
const infrastructureModules: NestModuleImport[] = [];

const controllers: any[] = [AuthenticationController, UsersController];

const queues: DynamicModule[] = [];

@Module({
  imports: [...appModules, ...infrastructureModules, ...queues],
  controllers: [...controllers],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(LOGGER)
    private readonly logger: ConsoleLogger,
  ) {}

  onModuleInit(): void {
    this.logger.setContext('AppModule');
  }
}
