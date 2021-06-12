import { String } from 'runtypes';

const AtLeastOneNumberRegex = /\d/;

export const Password = String.withConstraint(
  (maybeValidPassword) => maybeValidPassword.length >= 8 || 'Password should contain at least 8 characters',
).withConstraint((maybeValidPassword) => AtLeastOneNumberRegex.test(maybeValidPassword) || 'Password should contain at least one number');
