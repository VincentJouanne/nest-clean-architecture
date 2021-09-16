import { RealUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/realUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealAuthenticationService } from './secondaries/real/realAuthentication.service';
import { RealHashingService } from './secondaries/real/realHashing.service';
import { RealUserRepository } from './secondaries/real/realUser.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    RealUUIDGeneratorService,
    {
      provide: UserRepository,
      useClass: RealUserRepository,
    },
    RealAuthenticationService,
    RealHashingService,
  ],
  exports: [RealUUIDGeneratorService, UserRepository, RealAuthenticationService, RealHashingService],
})
export class IdentityAndAccessAdaptersModule {}
