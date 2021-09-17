import { ForbiddenException } from "@nestjs/common/exceptions/forbidden.exception";

export class IncorrectVerificationCodeException extends ForbiddenException {}