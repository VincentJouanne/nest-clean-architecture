import { AddUser } from '@call-identification/application/commands/addUser.command';
import { executeTask } from '@common/utils/executeTask';
import { Body, Controller, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { IdentifiesPhoneNumber } from 'call-identification/src/application/commands/identifiesPhoneNumber.command';
import { tryCatch } from 'fp-ts/lib/TaskEither';
import { AddUserDto } from '../dtos/addUser.dto';

@Controller('v1/calls')
@ApiTags('Calls')
export class CallsController {
  constructor(private readonly commandBus: CommandBus) {}
  @Post(':phoneNumber')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Match found !' })
  @ApiNotFoundResponse({ description: 'No phone number mathches the incoming call.' })
  @ApiParam({ name: 'phoneNumber', type: 'string', description: 'The incoming call phone number', example: '+33607395612' })
  async identifiesPhoneNumber(@Param('phoneNumber') phoneNumber: string): Promise<void> {
    const identifiesPhoneNumberTask = tryCatch(
      async () => {
        const command = new IdentifiesPhoneNumber(phoneNumber);
        return await this.commandBus.execute<IdentifiesPhoneNumber>(command);
      },
      (reason: unknown) => reason as Error,
    );

    return await executeTask(identifiesPhoneNumberTask);
  }

  @Patch('new-user')
  @HttpCode(200)
  @ApiOkResponse({ description: 'User added !' })
  @ApiBody({ type: AddUserDto })
  async addUser(@Body() addUserDto: AddUserDto): Promise<void> {
    const addUserTask = tryCatch(
      async () => {
        const command = new AddUser({
          id: addUserDto.id,
          firstName: addUserDto.firstName,
          lastName: addUserDto.lastName,
          avatarUrl: addUserDto.avatarUrl,
          phoneNumber: addUserDto.phoneNumber,
          company: addUserDto.company,
          notes: addUserDto.notes,
        });
        return await this.commandBus.execute<AddUser>(command);
      },
      (reason: unknown) => reason as Error,
    );

    return await executeTask(addUserTask);
  }
}
