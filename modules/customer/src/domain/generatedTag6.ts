import { Static, String } from 'runtypes';

export const GeneratedTag6 = String.withBrand('GeneratedTag6').withConstraint(
  (maybeTag) => maybeTag.length == 6 || 'Invalid Generated Tag of length 6',
);
export type GeneratedTag6 = Static<typeof GeneratedTag6>;
