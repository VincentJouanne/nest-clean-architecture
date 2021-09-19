import { ConflictException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {}
