import { Static, String } from 'runtypes';

const UUIDRegex = /^\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/;

export const UUID = String.withConstraint((maybeUUID) => UUIDRegex.test(maybeUUID) || 'Invalid UUID');
export type UUID = Static<typeof UUID>;
