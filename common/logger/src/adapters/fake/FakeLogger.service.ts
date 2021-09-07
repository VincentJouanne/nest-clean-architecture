import { ConsoleLogger } from '@nestjs/common';

export class FakeLoggerService extends ConsoleLogger {
  readonly contextName: string;

  constructor(readonly logger: null) {
    super();
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
