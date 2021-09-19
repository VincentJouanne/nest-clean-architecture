import { ForbiddenException } from '@nestjs/common';

export class IncorrectPasswordException extends ForbiddenException {
    constructor() {
        super('Incorrect password format. It must contains at least 8 characters including at least: one upper letter, one lower lettre and one digit')
    }
}
