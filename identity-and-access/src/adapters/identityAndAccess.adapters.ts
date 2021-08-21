import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { RealSecurityService } from '@identity-and-access/adapters/secondaries/real/realSecurity.service';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/uuidGenerator.service';
import { RealAuthenticationService } from './secondaries/real/realAuthentication.service';

@Module({
  imports: [CqrsModule],
  providers: [UUIDGeneratorService, InMemoryUserRepository, RealAuthenticationService, RealSecurityService],
  exports: [CqrsModule, UUIDGeneratorService, InMemoryUserRepository, RealAuthenticationService, RealSecurityService],
})
export class IdentityAndAccessAdaptersModule {}
