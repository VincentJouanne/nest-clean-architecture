import { AddUser, AddUserHandler } from '@call-identification/application/commands/addUser.command';
import { FakeUserRepository } from '@call-identification/infrastructure/adapters/secondaries/fake/fakeUser.repository';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { executeTask } from '@common/utils/executeTask';
import { Test } from '@nestjs/testing';

describe('[Unit] Identifies phone number', () => {
  let addUser: AddUserHandler;
  let repo: FakeUserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AddUserHandler, FakeUserRepository, { provide: PinoLoggerService, useClass: FakeLoggerService }],
    }).compile();

    addUser = moduleRef.get<AddUserHandler>(AddUserHandler);
    repo = moduleRef.get<FakeUserRepository>(FakeUserRepository);
  });

  it('Should not find a user if the phone number is unknown', async () => {
    const user = {
      id: '4',
      firstName: 'Vincent',
      lastName: 'JNE',
      avatarUrl: 'something',
      phoneNumber: '+33333333333',
      company: 'BAM',
      notes: 'something',
    };
    await addUser.execute(new AddUser(user));

    const userRetrieved = await executeTask(repo.getByPhoneNumber(user.phoneNumber));

    expect(userRetrieved).toStrictEqual({
      id: '4',
      firstName: 'Vincent',
      lastName: 'JNE',
      avatarUrl: 'something',
      phoneNumber: '+33333333333',
      company: 'BAM',
      notes: 'something',
    });
  });
});
