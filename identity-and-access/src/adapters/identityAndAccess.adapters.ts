import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { Module } from '@nestjs/common';
import { DefaultAuthenticationService } from './secondaries/real/defaultAuthentication.service';
import { RealUserRepository } from './secondaries/real/realUser.repository';

@Module({
  providers: [
    DefaultUUIDGeneratorService,
    {
      provide: UserRepository,
      useClass: RealUserRepository,
    },
    DefaultAuthenticationService,
  ],
  exports: [DefaultUUIDGeneratorService, UserRepository, DefaultAuthenticationService],
})
export class IdentityAndAccessAdaptersModule {}
