import * as uuid from 'uuid';
import { UUID } from '@modules/identity-and-access/domain/uuid';

export class UUIDGeneratorService {
  generateUUID = () => UUID.check(uuid.v4());
}
