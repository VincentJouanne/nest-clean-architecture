import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityAndAccessController } from './infrastructure/adapters/primaries/identityAndAccess.controller';
import { SignUpHandler } from './application/use-cases/commands/signUp.command';
import { SignInHandler } from './application/use-cases/commands/signIn.command';
import { VerifyEmailHandler } from './application/use-cases/commands/verifyEmail';
import { UserEventListener } from './application/listeners/userEvent.listener';
import { MailModule } from '@common/mail/mail.module';
import { LoggerModule } from '@common/logger/logger.module';
import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { RealUUIDGeneratorService } from './infrastructure/adapters/secondaries/real/realUUIDGenerator.service';
import { UserRepository } from './domain/repositories/user.repository';
import { RealUserRepository } from './infrastructure/adapters/secondaries/real/realUser.repository';
import { RealAuthenticationService } from './infrastructure/adapters/secondaries/real/realAuthentication.service';
import { RealRandomNumberGenerator } from './infrastructure/adapters/secondaries/real/realRandomNumberGenerator';
import { RealHashingService } from './infrastructure/adapters/secondaries/real/realHashing.service';
import { jwtConstants } from './domain/value-objects/constants';
import { JwtModule } from '@nestjs/jwt';

const commandHandlers = [SignUpHandler, SignInHandler, VerifyEmailHandler];
const eventListeners = [UserEventListener];
const services = [RealUUIDGeneratorService, RealAuthenticationService, RealHashingService, RealRandomNumberGenerator]
const repositories = [{
  provide: UserRepository,
  useClass: RealUserRepository,
}]

@Module({
  imports: [CqrsModule, DomainEventPublisherModule, LoggerModule, MailModule, JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60s' },
  })],
  providers: [
    IdentityAndAccessController,
    ...commandHandlers,
    ...eventListeners,
    ...services,
    ...repositories
  ],
  exports: [IdentityAndAccessController, RealAuthenticationService],
})
export class IdentityAndAccessModule { }
