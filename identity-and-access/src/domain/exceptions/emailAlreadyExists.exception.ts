import { ConflictException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
    constructor() {
        super('email already exists')
    }
}
