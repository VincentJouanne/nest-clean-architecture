import * as uuid from 'uuid';
import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefaultUUIDGeneratorService {
  generateUUID = () => UUID.check(uuid.v4());
}
