import { Static, String } from 'runtypes';

const EmailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const Email = String.withBrand('Email').withConstraint((maybeEmail) => EmailRegex.test(maybeEmail) || 'Invalid Email');

export type Email = Static<typeof Email>;
