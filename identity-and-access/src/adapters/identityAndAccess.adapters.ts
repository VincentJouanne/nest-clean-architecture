import { InMemoryUserRepository } from '@identity-and-access/adapters/secondaries/in-memory/inMemoryUser.repository';
import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DefaultAuthenticationService } from './secondaries/real/defaultAuthentication.service';
import { RealUserRepository } from './secondaries/real/realUser.repository';

@Module({
  imports: [CqrsModule],
  providers: [
    DefaultUUIDGeneratorService,
    {
      provide: 'UserRepository',
      useClass: RealUserRepository,
    },
    DefaultAuthenticationService,
  ],
  exports: [CqrsModule, DefaultUUIDGeneratorService, InMemoryUserRepository, DefaultAuthenticationService],
})
export class IdentityAndAccessAdaptersModule {}
