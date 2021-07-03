import { GeneratedTag6 } from '@modules/identity-and-access/domain/models/generatedTag6';
import { Injectable } from '@nestjs/common';
import { TagGeneratorService } from '../../domain/services/tagGenerator.service';

@Injectable()
export class InMemoryTagGeneratorService implements TagGeneratorService {
  generateTag6(): GeneratedTag6 {
    return GeneratedTag6.check('123456');
  }
}
