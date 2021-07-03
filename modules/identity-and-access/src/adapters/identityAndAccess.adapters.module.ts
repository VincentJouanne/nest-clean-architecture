import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InMemoryTagGeneratorService } from '@modules/identity-and-access/adapters/secondaries/inMemoryTagGenerator.service';
import { InMemoryUserRepository } from '@modules/identity-and-access/adapters/secondaries/inMemoryUser.repository';
import { PasswordHashingService } from '@modules/identity-and-access/adapters/secondaries/passwordHashing.service';
import { UUIDGeneratorService } from '@modules/identity-and-access/adapters/secondaries/uuidGenerator.service';

@Module({
  imports: [CqrsModule],
  providers: [InMemoryTagGeneratorService, UUIDGeneratorService, InMemoryUserRepository, PasswordHashingService],
  exports: [CqrsModule, InMemoryTagGeneratorService, UUIDGeneratorService, InMemoryUserRepository, PasswordHashingService],
})
export class IdentityAndAccessAdaptersModule {}
