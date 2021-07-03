// Import from "nest"
import { LoggerService } from '@nestjs/common';

import { pipe } from 'fp-ts/lib/function';
import { right, chain, TaskEither } from 'fp-ts/lib/TaskEither';
import { RuntypeBase } from 'runtypes/lib/runtype';
import { validateWith } from './validateWith';
import { handleLog } from './handleLog';

export const fromUnknown = <Data>(
  unknownValue: unknown,
  validator: RuntypeBase<Data>,
  logger: LoggerService,
  dataKind: string,
): TaskEither<Error, Data> => {
  return pipe(
    right(unknownValue),
    chain(validateWith(validator)),
    handleLog(logger, `${dataKind} parsed successfully.`, `${dataKind} corrupted or outdated`),
  );
};
