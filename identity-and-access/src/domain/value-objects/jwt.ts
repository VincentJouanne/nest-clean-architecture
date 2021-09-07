import { Static, String } from 'runtypes';

export const JWT = String.withBrand('JWT');
export type JWT = Static<typeof JWT>;
