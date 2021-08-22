import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { DefaultAuthenticationService } from './secondaries/real/defaultAuthentication.service';

@Module({
  imports: [CqrsModule],
  providers: [DefaultUUIDGeneratorService, InMemoryUserRepository, DefaultAuthenticationService],
  exports: [CqrsModule, DefaultUUIDGeneratorService, InMemoryUserRepository, DefaultAuthenticationService],
})
export class IdentityAndAccessAdaptersModule {}
