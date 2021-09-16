import { UUID } from '@identity-and-access/domain/value-objects/uuid';
import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';

@Injectable()
export class RealUUIDGeneratorService {
  generateUUID = () => UUID.check(uuid.v4());
}
