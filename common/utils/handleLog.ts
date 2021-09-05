import { LoggerService } from '@nestjs/common';
import { pipe } from 'fp-ts/lib/function';
import { map, mapLeft, TaskEither } from 'fp-ts/lib/TaskEither';

/**
 * Given a logger, and success and failure message, return a combination of .map and mapLeft to log both success and error case
 *
 */
export const handleLog =
  <ErrorLike extends Error, DataLike>(logger: LoggerService, successMessage: string, warningMessage: string) =>
  (task: TaskEither<ErrorLike, DataLike>): TaskEither<ErrorLike, DataLike> => {
    return pipe(
      task,
      mapLeft((error: ErrorLike) => {
        logger.warn(warningMessage);
        logger.warn(error.constructor.name);
        logger.debug ? logger.debug(error) : logger.error(error);
        return error;
      }),
      map((data: DataLike) => {
        logger.debug ? logger.debug(successMessage) : logger.log(successMessage);
        logger.verbose ? logger.verbose(data) : logger.log(data);;
        return data;
      }),
    );
  };
