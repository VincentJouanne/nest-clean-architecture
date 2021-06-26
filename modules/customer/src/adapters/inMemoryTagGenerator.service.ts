import { GeneratedTag6 } from '../domain/generatedTag6';
import { TagGeneratorService } from '../domain/services/tagGenerator.service';

export class InMemoryTagGeneratorService implements TagGeneratorService {
  generateTag6(): GeneratedTag6 {
    return GeneratedTag6.check('123456');
  }
}
