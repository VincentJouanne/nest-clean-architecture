import { DomainEventPublisherModule } from '@common/domain-event-publisher/domainEventPublisher.module';
import { LoggerModule } from '@common/logger/logger.module';
import { MailModule } from '@common/mail/mail.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { SignInHandler } from './application/use-cases/commands/signIn.command';
import { SignUpHandler } from './application/use-cases/commands/signUp.command';
import { VerifyEmailHandler } from './application/use-cases/commands/verifyEmail';
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
  imports: [CqrsModule, DomainEventPublisherModule, LoggerModule, MailModule, JwtModule.register({
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
