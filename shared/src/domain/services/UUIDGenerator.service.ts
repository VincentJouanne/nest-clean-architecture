import { UUID } from '../uuid';

export interface UUIDGeneratorService {
  generateUUID: () => UUID;
}
