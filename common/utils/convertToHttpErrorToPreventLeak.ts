import { orElse, left, TaskEither } from 'fp-ts/lib/TaskEither';
import { HttpException, LoggerService } from '@nestjs/common';

interface ErrorMap {
  [errorName: string]: HttpException;
  default: HttpException;
}

/**
 * Given a map of { internalBusinessErrorName => externalHttpErrorWithMessage }, analyze the error and replace with an external ready error.
 * This is down to prevent leaking.
 *
 * @param errorMap
 */
export const convertToHttpErrorToPreventLeak =
  (errorMap: ErrorMap, logger: LoggerService) =>
  <Data>(task: TaskEither<Error, Data>): TaskEither<HttpException, Data> => {
    // TODO: convert this to mapLeft
    return orElse<Error, Data, HttpException>((error) => {
      if (error instanceof HttpException) {
        return left(error);
      }
      const httpError = errorMap[error.constructor.name];
      if (httpError) {
        // TODO: fix this usage of logger
        logger.warn(`Real Error: ${error.name} ${error.message}`);
        logger.warn(`Returned error: ${httpError.name} ${httpError.message}`);
        return left(httpError);
      }
      // TODO: fix this usage of logger
      logger.error(`Unexpected error: ${error.name} ${error.message}`);
      logger.warn(error.stack);
      return left(errorMap.default);
    })(task);
  };
