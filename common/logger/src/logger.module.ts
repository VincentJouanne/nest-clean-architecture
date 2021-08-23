import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { PinoLoggerService } from './adapters/pinoLogger.service';
import * as uuid from 'uuid';
import { ConfigService } from '@nestjs/config';
import { BasicLoggerService } from './adapters/basicLogger.service';

declare module 'http' {
  interface IncomingMessage {
    requestId: string;
  }
}

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        name: 'clean-architecture-fp-demo',
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        genReqId: (req) => req.requestId || uuid.v4(),
        formatters: { bindings: () => ({}) },
        // redact
        timestamp: stdTimeFunctions.unixTime,
      },
    }),
  ],
  providers: [BasicLoggerService, PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
