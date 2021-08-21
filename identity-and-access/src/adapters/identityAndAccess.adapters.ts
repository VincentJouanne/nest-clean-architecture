import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { PasswordHashingService } from '@identity-and-access/adapters/secondaries/real/passwordHashing.service';
import { UUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/uuidGenerator.service';
import { RealAuthenticationService } from './secondaries/real/realAuthentication.service';

@Module({
  imports: [CqrsModule],
  providers: [UUIDGeneratorService, InMemoryUserRepository, RealAuthenticationService, PasswordHashingService],
  exports: [CqrsModule, UUIDGeneratorService, InMemoryUserRepository, RealAuthenticationService, PasswordHashingService],
})
export class IdentityAndAccessAdaptersModule {}
