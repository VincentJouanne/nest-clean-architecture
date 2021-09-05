import { UnprocessableEntityException } from '@nestjs/common';
import { Either, left, mapLeft, right } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { fromEither, TaskEither } from 'fp-ts/lib/TaskEither';
import { ValidationError } from 'io-ts';
import { RuntypeBase } from 'runtypes/lib/runtype';

/**
 * Decode, in TaskEither scope using io-ts.
 * In fact, io-ts:
 * - works synchronously (`Task` and not `TaskEither`)
 * - returns `Errors` as left which is typically `Error[]`
 * In order to use it more easily, this small helper makes the mandatory conversion
 *
 * @param validator : an io-ts validator
 */
export const validateWith =
  <Input, Data>(validator: RuntypeBase<Data>, dataKind: string) =>
  (data: Input): TaskEither<Error, Data> => {
    return pipe(
      data,
      checkEither(validator.check),
      mapLeft(() => new UnprocessableEntityException(`The data ${dataKind} is invalid`, `invalid-${dataKind}`)),
      fromEither,
    );
  };

const checkEither =
  <D>(check: (value: any) => D) =>
  (value: any): Either<ValidationError, D> => {
    try {
      const checkedValue = check(value);
      return right(checkedValue);
    } catch (error) {
      return left(error);
    }
  };
