import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { AddUserHandler } from './application/commands/addUser.command';
import { IdentifiesPhoneNumberHandler } from './application/commands/identifiesPhoneNumber.command';
import { CallsController } from './infrastructure/adapters/primaries/controllers/calls.controller';
import { FakeUserRepository } from './infrastructure/adapters/secondaries/fake/fakeUser.repository';

const controllers: any[] = [CallsController];
const commandHandlers = [IdentifiesPhoneNumberHandler, AddUserHandler];
const repositories = [FakeUserRepository];

@Module({
  imports: [
    CqrsModule,
    LoggerModule,
    JwtModule.register({
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [...controllers, ...commandHandlers, ...repositories],
  exports: [...controllers],
})
export class CallIdentificationModule {}
