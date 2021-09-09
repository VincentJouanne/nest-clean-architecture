import { ForbiddenException } from '@nestjs/common';

export class IncorrectPasswordException extends ForbiddenException {}
