import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';
import * as uuid from 'uuid';
import { FakeLoggerService } from './adapters/fake/FakeLogger.service';
import { PinoLoggerService } from './adapters/real/pinoLogger.service';

declare module 'http' {
  interface IncomingMessage {
    requestId: string;
  }
}

export const LOGGER = 'LOGGER';
const loggerProvider = { useClass: process.env.NODE_ENV === 'test' ? FakeLoggerService : PinoLoggerService, provide: LOGGER };
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
  providers: [loggerProvider],
  exports: [loggerProvider],
})
export class LoggerModule {}
