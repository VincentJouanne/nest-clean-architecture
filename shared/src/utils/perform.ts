import { LoggerService } from '@nestjs/common';

import { pipe } from 'fp-ts/lib/function';
import { right, chain, TaskEither } from 'fp-ts/lib/TaskEither';

import { handleLog } from './handleLog';

export const perform = <InputLike, OutputLike, ErrorLike extends Error>(
  data: InputLike,
  action: (data: InputLike) => TaskEither<ErrorLike, OutputLike>,
  logger: LoggerService,
  actionDescription: string,
): TaskEither<ErrorLike, OutputLike> => {
  return pipe(right(data), chain(action), handleLog(logger, `Successfully managed to ${actionDescription}`, `Failed to ${actionDescription}`));
};
