import { ForbiddenException } from "@nestjs/common/exceptions/forbidden.exception";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";

export class IncorrectVerificationCodeException extends UnauthorizedException {
    constructor() {
        super('The provided verification code do not match with the one we sent you by email.')
    }
}