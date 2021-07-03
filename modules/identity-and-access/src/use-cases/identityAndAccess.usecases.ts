import { Module } from '@nestjs/common';
import { IdentityAndAccessAdaptersModule } from '../adapters/identityAndAccess.adapters.module';
import { SignUpHandler } from './commands/signUp.command';

const commandHandlers = [SignUpHandler];
@Module({
  imports: [IdentityAndAccessAdaptersModule],
  providers: [...commandHandlers],
})
export class IdentityAndAccessUseCasesModule {}
