import { DefaultUUIDGeneratorService } from '@identity-and-access/adapters/secondaries/real/defaultUUIDGenerator.service';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { jwtConstants } from '@identity-and-access/domain/value-objects/constants';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DefaultAuthenticationService } from './secondaries/real/defaultAuthentication.service';
import { DefaultHashingService } from './secondaries/real/defaultHashing.service';
import { RealUserRepository } from './secondaries/real/realUser.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    DefaultUUIDGeneratorService,
    {
      provide: UserRepository,
      useClass: RealUserRepository,
    },
    DefaultAuthenticationService,
    DefaultHashingService,
  ],
  exports: [DefaultUUIDGeneratorService, UserRepository, DefaultAuthenticationService, DefaultHashingService],
})
export class IdentityAndAccessAdaptersModule {}
