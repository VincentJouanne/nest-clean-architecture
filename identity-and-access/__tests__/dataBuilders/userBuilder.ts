import { executeTask } from "@common/utils/executeTask";
import { User } from "@identity-and-access/domain/entities/user";
import { PlainPassword } from "@identity-and-access/domain/value-objects/password";
import { RealHashingService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realHashing.service";

export const UserBuilder = (hashingService?: RealHashingService) => {

  let passwordHashingService = hashingService

  const defaultProperties = {
    id: 'b8a11695-3c71-45b4-9dd8-14900412f4e1',
    password: 'Passw0rd!',
    contactInformation: {
      email: 'myemail@gmail.com',
      verificationCode: '1234',
      isVerified: false
    }
  };
  const overrides = {
    ...defaultProperties
  };

  return {
    withId(id: string) {
      overrides.id = id;
      return this;
    },

    withEmail(email: string) {
      overrides.contactInformation.email = email
      return this
    },

    async withPassword(password: string) {
      if (passwordHashingService != undefined)
        overrides.password = await executeTask(passwordHashingService.hashPlainPassword(PlainPassword.check(password)));
      return this
    },

    build(): User {
      return User.check({
        ...defaultProperties,
        ...overrides,
      });
    }

  }
}