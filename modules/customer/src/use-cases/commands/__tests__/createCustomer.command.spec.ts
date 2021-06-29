import { CreateCustomer, CreateCustomerHandler } from '@modules/customer/use-cases/commands/createCustomer.command';
import { InMemoryUUIDGeneratorService } from '@shared/adapters/inMemoryUUIDGenerator.service';
import { InMemoryTagGeneratorService } from '@modules/customer/adapters/inMemoryTagGenerator.service';
import { InMemoryCustomerRepository } from '@modules/customer/adapters/inMemoryCustomer.repository';
import { InMemoryLoggerService } from '@shared/adapters/inMemoryLogger.service';
import { executeTask } from '@shared/utils/executeTask';
import { Test } from '@nestjs/testing';
import { Customer } from '@modules/customer/domain/customer';

describe('[Unit] Create customer with an email', () => {
  //Adapters
  let uuidGeneratorService: InMemoryUUIDGeneratorService;
  let tagGeneratorService: InMemoryTagGeneratorService;
  let customerRepository: InMemoryCustomerRepository;
  let logger: InMemoryLoggerService;

  //Use-case
  let createCustomerHandler: CreateCustomerHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [InMemoryUUIDGeneratorService, InMemoryTagGeneratorService, InMemoryCustomerRepository, InMemoryLoggerService],
    }).compile();

    uuidGeneratorService = moduleRef.get<InMemoryUUIDGeneratorService>(InMemoryUUIDGeneratorService);
    tagGeneratorService = moduleRef.get<InMemoryTagGeneratorService>(InMemoryTagGeneratorService);
    customerRepository = moduleRef.get<InMemoryCustomerRepository>(InMemoryCustomerRepository);
    logger = moduleRef.get<InMemoryLoggerService>(InMemoryLoggerService);

    createCustomerHandler = new CreateCustomerHandler(uuidGeneratorService, tagGeneratorService, customerRepository, logger);
  });

  it('OK - Should create a customer if email is valid', async () => {
    //Given a potentially valid email
    const email = 'dummy@gmail.com';

    //When we create a customer
    const result = await createCustomerHandler.execute(new CreateCustomer(email));

    //Then it should have created a customer
    expect(result).toEqual(undefined);

    const customers = await executeTask(customerRepository.all());
    expect(customers.length).toEqual(1);
  });

  it('KO - Should not create a customer if email is invalid', async () => {
    //Given a potentially invalid email
    const email = 'abc123';

    //When we create a customer
    const resultPromise = createCustomerHandler.execute(new CreateCustomer(email));

    //Then it should have thrown an error and not have created a customer
    await expect(resultPromise).rejects.toBeTruthy();

    const customers = await executeTask(customerRepository.all());
    expect(customers.length).toEqual(0);
  });

  it('KO - Should not create a customer if email already exists', async () => {
    //Given an existing customer
    const email = 'dummy1@gmail.com';
    await executeTask(
      customerRepository.save(Customer.check({ id: uuidGeneratorService.generateUUID(), tag: tagGeneratorService.generateTag6(), email: email })),
    );

    //When we create a customer
    const resultPromise = createCustomerHandler.execute(new CreateCustomer(email));

    //Then it should have thrown an error and not have created a customer
    await expect(resultPromise).rejects.toBeTruthy();

    const customers = await executeTask(customerRepository.all());
    expect(customers.length).toEqual(1);
  });
});
