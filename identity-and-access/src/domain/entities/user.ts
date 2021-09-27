import { fromUnknown } from '@common/utils/fromUnknown';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { LoggerService } from '@nestjs/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Record, Static } from 'runtypes';
import { ContactInformation } from '../value-objects/contactInformation';
import { HashedPassword } from '../value-objects/password';

export const UserId = UUID.withBrand('UserId');
export type UserId = Static<typeof UserId>;

export const User = Record({
  id: UserId,
  password: HashedPassword,
  contactInformation: ContactInformation,
});
export type User = Static<typeof User>;


export const verifyUserEmail = (user: User, logger: LoggerService): TaskEither<Error, User> => {
  return fromUnknown({ ...user, contactInformation: { ...user.contactInformation, isVerified: true } }, User, logger, 'user')
}