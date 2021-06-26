import * as uuid from 'uuid';
import { UUIDGeneratorService } from '@shared/domain/services/UUIDGenerator.service';
import { UUID } from '@shared/domain/uuid';

export class InMemoryUUIDGeneratorService implements UUIDGeneratorService {
  generateUUID = () => UUID.check(uuid.v4());
}
