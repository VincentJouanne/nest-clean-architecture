import { Record, Static, String } from 'runtypes';

export const User = Record({
  id: String,
  firstName: String,
  lastName: String,
  avatarUrl: String,
  phoneNumber: String,
  company: String,
  notes: String,
});

export type User = Static<typeof User>;
