import { LoggerService } from '@nestjs/common';

export class BasicLoggerService implements LoggerService {
  readonly contextName: string;

  constructor(readonly logger: null) {
    this.contextName = 'context';
  }

  public log = (...args) => console.log('[debug]', ...args);
  public debug = (...args) => console.log('[debug]', ...args);
  public verbose = (...args) => console.log('[verbose]', ...args);
  public info = (...args) => console.log('[info]', ...args);
  public warn = (...args) => console.log('[warning]', ...args);
  public error = (...args) => console.log('[error]', ...args);
  public setContext = (...args) => console.log('[context]', ...args);
}
