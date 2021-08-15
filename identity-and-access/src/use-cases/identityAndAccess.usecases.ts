import { IdentityAndAccessAdaptersModule } from '@identity-and-access/adapters/identityAndAccess.adapters';
import { Module } from '@nestjs/common';
import { SignUpHandler } from './commands/signUp.command';

const commandHandlers = [SignUpHandler];
@Module({
  imports: [IdentityAndAccessAdaptersModule],
  providers: [...commandHandlers],
})
export class IdentityAndAccessUseCasesModule {}
