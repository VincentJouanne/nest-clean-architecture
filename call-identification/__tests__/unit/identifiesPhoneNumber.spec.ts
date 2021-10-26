import { IdentifiesPhoneNumber, IdentifiesPhoneNumberHandler } from '@call-identification/application/commands/identifiesPhoneNumber.command';
import { UserNotFoundException } from '@call-identification/domain/exceptions/userNotFound.exception';
import { FakeUserRepository } from '@call-identification/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Test } from '@nestjs/testing';

describe('[Unit] Identifies phone number', () => {
  let identifiesPhoneNumber: IdentifiesPhoneNumberHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [IdentifiesPhoneNumberHandler, FakeUserRepository, { provide: PinoLoggerService, useClass: FakeLoggerService }],
    }).compile();

    identifiesPhoneNumber = moduleRef.get<IdentifiesPhoneNumberHandler>(IdentifiesPhoneNumberHandler);
  });

  it('Should not find a user if the phone number is unknown', async () => {
    const resultPromise = identifiesPhoneNumber.execute(new IdentifiesPhoneNumber('+33000000000'));

    await expect(resultPromise).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('Should find a user if the phone number is known', async () => {
    const result = await identifiesPhoneNumber.execute(new IdentifiesPhoneNumber('+33607395612'));

    expect(result).toEqual({
      id: '1',
      firstName: 'Vincent',
      lastName: 'JOUANNE',
      avatarUrl: '',
      phoneNumber: '+33607395612',
      company: 'BAM',
      notes: 'Vincent works at BAM.',
    });
  });
});
