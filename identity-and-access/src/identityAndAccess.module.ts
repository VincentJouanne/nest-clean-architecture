import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '@notifications/notifications.module';
import { SignInHandler } from './application/commands/signIn.command';
import { SignUpHandler } from './application/commands/signUp.command';
import { VerifyEmailHandler } from './application/commands/verifyEmail.command';
import { UserRepository } from './domain/repositories/user.repository';
import { jwtConstants } from './domain/value-objects/constants';
import { IdentityAndAccessController } from './infrastructure/adapters/primaries/identityAndAccess.controller';
import { RealAuthenticationService } from './infrastructure/adapters/secondaries/real/realAuthentication.service';
import { RealHashingService } from './infrastructure/adapters/secondaries/real/realHashing.service';
import { RealRandomNumberGenerator } from './infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { RealUserRepository } from './infrastructure/adapters/secondaries/real/realUser.repository';
import { RealUUIDGeneratorService } from './infrastructure/adapters/secondaries/real/realUUIDGenerator.service';

const commandHandlers = [SignUpHandler, SignInHandler, VerifyEmailHandler];
const services = [RealUUIDGeneratorService, RealAuthenticationService, RealHashingService, RealRandomNumberGenerator]
const repositories = [{
  provide: UserRepository,
  useClass: RealUserRepository,
}]

@Module({
  imports: [CqrsModule, DomainEventPublisherModule, LoggerModule, NotificationsModule, JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60s' },
  })],
  providers: [
    IdentityAndAccessController,
    ...commandHandlers,
    ...services,
    ...repositories
  ],
  exports: [IdentityAndAccessController, RealAuthenticationService],
})
export class IdentityAndAccessModule { }
