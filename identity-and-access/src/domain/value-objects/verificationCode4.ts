import { Static, String } from 'runtypes';

const OnlyNumbersRegex = /^\d+$/;
export const VerificationCode4 = String.withBrand('VerificationCode4')
  .withConstraint((maybeVerificationCode4) => maybeVerificationCode4.length == 4)
  .withConstraint((maybeVerificationCode4) => OnlyNumbersRegex.test(maybeVerificationCode4));
export type VerificationCode4 = Static<typeof VerificationCode4>;
