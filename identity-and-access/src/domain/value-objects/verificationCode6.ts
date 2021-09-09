import { Static, String } from 'runtypes';

const OnlyNumbersRegex = /^\d+$/;
export const VerificationCode6 = String.withBrand('VerificationCode6')
  .withConstraint((maybeVerificationCode6) => maybeVerificationCode6.length == 6)
  .withConstraint((maybeVerificationCode6) => OnlyNumbersRegex.test(maybeVerificationCode6));
export type VerificationCode6 = Static<typeof VerificationCode6>;
