import { Global, Module } from '@nestjs/common';
import { InMemoryMailService } from './adapters/inMemoryMail.service';

@Global()
@Module({
  imports: [InMemoryMailService],
  providers: [InMemoryMailService],
  exports: [InMemoryMailService],
})
export class MailModule {}
