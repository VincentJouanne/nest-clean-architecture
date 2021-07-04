import * as uuid from 'uuid';
import { UUID } from '@identity-and-access/domain/models/uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UUIDGeneratorService {
  generateUUID = () => UUID.check(uuid.v4());
}
