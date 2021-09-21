import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { VerificationCode4 } from "@identity-and-access/domain/value-objects/verificationCode4";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";


@Injectable()
export class RealRandomNumberGenerator {
    constructor() {}

    generateRandomVerificationCode = (): TaskEither<Error, VerificationCode4 > => {
        return tryCatch(
            async () => {
                let random4Digit = Math.floor(1000 + Math.random() * 9000).toString();
                return VerificationCode4.check(random4Digit);
            },
            (reason: unknown) => new InternalServerErrorException(),
        )
    }

}