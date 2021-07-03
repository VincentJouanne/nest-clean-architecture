import { Contract, Static, String, Unknown } from 'runtypes';

const AtLeastOneLowerLetterRegex = /(?=.*[a-z])/;
const AtLeastOneUpperLetterRegex = /(?=.*[A-Z])/;
const AtLeastOneDigitRegex = /\d/;

export const PlainPassword = String.withBrand('PlainPassword')
  .withConstraint((maybeValidPassword) => maybeValidPassword.length >= 8 || 'Password should contain at least 8 characters.')
  .withConstraint((maybeValidPassword) => AtLeastOneLowerLetterRegex.test(maybeValidPassword) || 'Password should contain at least one lower.')
  .withConstraint((maybeValidPassword) => AtLeastOneUpperLetterRegex.test(maybeValidPassword) || 'Password should contain at least one upper letter.')
  .withConstraint((maybeValidPassword) => AtLeastOneDigitRegex.test(maybeValidPassword) || 'Password should contain at least one digit.');

export const EncryptedPassword = String.withBrand('EncryptedPassword');

export type PlainPassword = Static<typeof PlainPassword>;
export type EncryptedPassword = Static<typeof EncryptedPassword>;
