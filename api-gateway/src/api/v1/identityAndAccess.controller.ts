import { PinoLoggerService } from '@common/logger/adapters/pinoLogger.service';
import { IdentityAndAccessController } from '@identity-and-access/adapters/primaries/identityAndAccess.controller';
import { BadRequestException, Controller, HttpCode, InternalServerErrorException, Post, Body, UnprocessableEntityException } from '@nestjs/common';
import { ApiConflictResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { executeTask } from '@common/utils/executeTask';
import { SignUpDto } from '../dtos/signUp.dto';
import { convertToHttpErrorToPreventLeak } from '@common/utils/convertToHttpErrorToPreventLeak';
import { pipe } from 'fp-ts/lib/function';

@Controller('v1')
@ApiTags('Identity and access')
export class IdentityAndAccessApiControllerV1 {
  constructor(private readonly identityAndAccessController: IdentityAndAccessController, private readonly logger: PinoLoggerService) {}

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Sign up a user by creating an account.',
    description: `Given a valid email and a password, it creates an account for an anonymous user.`,
  })
  @ApiUnprocessableEntityResponse({ description: 'Email or password invalid.' })
  @ApiConflictResponse({ description: 'Email already exists.' })
  async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    const errorMap = {
      default: new InternalServerErrorException('Something wrong happened'),
    };

    const task = pipe(
      this.identityAndAccessController.signUp(signUpDto.email, signUpDto.password),
      convertToHttpErrorToPreventLeak(errorMap, this.logger),
    );
    return await executeTask(task);
  }
}
