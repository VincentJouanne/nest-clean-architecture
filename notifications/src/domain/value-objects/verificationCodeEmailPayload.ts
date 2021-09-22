import { VerificationCode4 } from "@identity-and-access/domain/value-objects/verificationCode4";
import { Record, Static } from "runtypes";
import { Email } from "./email";

export const VerificationCodeEmailPayload = Record({
    to: Email,
    verificationCode: VerificationCode4
})

export type VerificationCodeEmailPayload = Static<typeof VerificationCodeEmailPayload>