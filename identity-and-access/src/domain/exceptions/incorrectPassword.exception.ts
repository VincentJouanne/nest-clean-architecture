import { ForbiddenException } from '@nestjs/common';

export class IncorrectPasswordException extends ForbiddenException {
    constructor() {
        super('Incorrect password.')
    }
}
