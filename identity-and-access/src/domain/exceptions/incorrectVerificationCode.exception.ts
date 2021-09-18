import { ForbiddenException } from "@nestjs/common/exceptions/forbidden.exception";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";

export class IncorrectVerificationCodeException extends UnauthorizedException {}