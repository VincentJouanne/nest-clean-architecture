import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { convertToHttpErrorToPreventLeak } from '@common/utils/convertToHttpErrorToPreventLeak';
import { executeTask } from '@common/utils/executeTask';
import { IdentityAndAccessController } from '@identity-and-access/adapters/primaries/identityAndAccess.controller';
import { Body, Controller, HttpCode, InternalServerErrorException, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { pipe } from 'fp-ts/lib/function';
import { map } from 'fp-ts/lib/TaskEither';
import { SignInRequestDto, SignInResponseDto } from '../dtos/signIn.dto';
import { SignUpDto } from '../dtos/signUp.dto';

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

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in a user by validating its credentials and return him a JWT.',
    description: `Given a valid email and a password of an existing user, it returns a JWT.`,
  })
  @ApiUnprocessableEntityResponse({ description: 'Email or password invalid.' })
  @ApiForbiddenResponse({ description: 'Wrong password provided or User did not verified its email address.' })
  @ApiNotFoundResponse({ description: 'No user associated to the given email.' })
  async signIn(@Body() signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    const errorMap = {
      default: new InternalServerErrorException('Something wrong happened'),
    };

    const task = pipe(
      this.identityAndAccessController.signIn(signInRequestDto.email, signInRequestDto.password),
      convertToHttpErrorToPreventLeak(errorMap, this.logger),
      map((jwt) => ({
        access_token: jwt,
      })),
    );

    return await executeTask(task);
  }
}
