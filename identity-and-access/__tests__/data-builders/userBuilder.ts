import { User } from "@identity-and-access/domain/entities/user";
import { HashedPassword } from "@identity-and-access/domain/value-objects/password";

export const UserBuilder = () => {

  const defaultProperties = {
    id: 'b8a11695-3c71-45b4-9dd8-14900412f4e1',
    password: '',
    contactInformation: {
      email: 'myemail@gmail.com',
      verificationCode: '1234',
      isVerified: false
    }
  };
  const overrides = {
    id: 'b8a11695-3c71-45b4-9dd8-14900412f4e1',
    password: '',
    contactInformation: {
      email: 'myemail@gmail.com',
      verificationCode: '1234',
      isVerified: false
    }
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

    withHashedPassword(hashedPassword: HashedPassword) {
      overrides.password = hashedPassword;
      return this
    },

    withVerificationCode(code: string) {
      overrides.contactInformation.verificationCode = code;
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