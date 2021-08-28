import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';
import * as uuid from 'uuid';
import { MockedLoggerService } from './adapters/mockedLogger.service';
import { PinoLoggerService } from './adapters/pinoLogger.service';

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
  providers: [MockedLoggerService, PinoLoggerService],
  exports: [MockedLoggerService, PinoLoggerService],
})
export class LoggerModule {}
