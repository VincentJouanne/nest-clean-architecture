import { Static, String } from 'runtypes';

export const RefreshToken = String.withBrand('RefreshToken');
export type RefreshToken = Static<typeof RefreshToken>;