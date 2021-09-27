import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '@notifications/notifications.module';
import { RefreshTokensHandler } from './application/commands/refreshTokens.command';
import { SignInHandler } from './application/commands/signIn.command';
import { SignUpHandler } from './application/commands/signUp.command';
import { VerifyEmailHandler } from './application/commands/verifyEmail.command';
import { AuthenticationController } from './infrastructure/adapters/primaries/controllers/authentication.controller';
import { UsersController } from './infrastructure/adapters/primaries/controllers/users.controller';
import { RealAuthenticationService } from './infrastructure/adapters/secondaries/real/realAuthentication.service';
import { RealHashingService } from './infrastructure/adapters/secondaries/real/realHashing.service';
import { RealRandomNumberGenerator } from './infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { RealUserRepository } from './infrastructure/adapters/secondaries/real/realUser.repository';
import { RealUUIDGeneratorService } from './infrastructure/adapters/secondaries/real/realUUIDGenerator.service';
import { UserRepository } from './infrastructure/ports/user.repository';

const controllers = [AuthenticationController, UsersController]
const commandHandlers = [SignUpHandler, SignInHandler, RefreshTokensHandler, VerifyEmailHandler];
const services = [RealUUIDGeneratorService, RealAuthenticationService, RealHashingService, RealRandomNumberGenerator]
const repositories = [{
  provide: UserRepository,
  useClass: RealUserRepository,
}]

@Module({
  imports: [CqrsModule, DomainEventPublisherModule, LoggerModule, NotificationsModule, JwtModule.register({
    signOptions: { expiresIn: '15m' },
  })],
  providers: [
    ...controllers,
    ...commandHandlers,
    ...services,
    ...repositories
  ],
  exports: [...controllers, RealAuthenticationService],
})
export class IdentityAndAccessModule { }
