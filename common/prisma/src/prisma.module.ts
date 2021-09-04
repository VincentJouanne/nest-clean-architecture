import { Global, Module } from '@nestjs/common';
import { PrismaService } from './adapters/prisma.service';

@Global()
@Module({
  imports: [PrismaService],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
