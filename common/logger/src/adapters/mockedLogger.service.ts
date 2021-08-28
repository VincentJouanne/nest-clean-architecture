import { LoggerService } from '@nestjs/common';

export class MockedLoggerService implements LoggerService {
  readonly contextName: string;

  constructor(readonly logger: null) {
    this.contextName = 'context';
  }

  public log = () => {};
  public debug = () => {};
  public verbose = () => {};
  public info = () => {};
  public warn = () => {};
  public error = () => {};
  public setContext = () => {};
}
