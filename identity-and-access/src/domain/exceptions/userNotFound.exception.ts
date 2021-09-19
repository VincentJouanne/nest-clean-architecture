import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
    constructor() {
        super('This user do not exists.')
    }
}
