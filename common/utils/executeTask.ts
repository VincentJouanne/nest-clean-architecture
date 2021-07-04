import { pipe } from 'fp-ts/lib/function';
import * as Either from 'fp-ts/lib/Either';
import { TaskEither } from 'fp-ts/lib/TaskEither';

/**
 * Given a taskEither, execute the task, await the result and return a promise.
 * It is used a lot as nest rely pretty heavily on Promise
 *
 * @param task: a TaskEither
 */
export const executeTask = async <E, A>(task: TaskEither<E, A>): Promise<A> => {
  const result = await task();
  return new Promise((resolve, reject) => {
    pipe(result, Either.fold(reject, resolve));
  });
};

/**
 * Given a taskEither, execute the task, and call the onLeft or OnRight callback.
 *
 * @param task: a TaskEither
 * @param onLeft
 * @param onRight
 */
export const executeAndHandle = async <E, A, B>(task: TaskEither<E, A>, onLeft: (error: E) => B, onRight: (data: A) => B): Promise<B> => {
  const result = await task();
  return pipe(result, Either.fold<E, A, B>(onLeft, onRight));
};
