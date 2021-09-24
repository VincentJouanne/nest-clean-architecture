import { executeTask } from "@common/utils/executeTask";
import { HashedPassword, PlainPassword } from "@identity-and-access/domain/value-objects/password";
import { RealHashingService } from "@identity-and-access/infrastructure/adapters/secondaries/real/realHashing.service";

export const PasswordBuilder = (hashingService: RealHashingService, password: string) => {
  let passwordHashingService = hashingService

  return {
      async build(): Promise<HashedPassword> {
          return await executeTask(passwordHashingService.hashPlainPassword(PlainPassword.check(password)));
        }
    }
}