import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { convertToHttpErrorToPreventLeak } from '@common/utils/convertToHttpErrorToPreventLeak';
import { executeTask } from '@common/utils/executeTask';
import { IdentityAndAccessController } from '@identity-and-access/infrastructure/adapters/primaries/identityAndAccess.controller';
import { Body, Controller, HttpCode, InternalServerErrorException, Post, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { pipe } from 'fp-ts/lib/function';
import { map } from 'fp-ts/lib/TaskEither';
import { SignInRequestDto, SignInResponseDto } from '../dtos/signIn.dto';
import { SignUpDto } from '../dtos/signUp.dto';
import { VerifyEmailRequestDto } from '../dtos/verifyEmail.dto';
import { AuthenticationGuard } from '@identity-and-access/infrastructure/adapters/primaries/guards/authentication.guard';

@Controller('v1')
@ApiTags('Identity and access')
export class IdentityAndAccessApiControllerV1 {
  constructor(private readonly identityAndAccessController: IdentityAndAccessController, private readonly logger: PinoLoggerService) { }

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Sign up a user by creating an account.',
    description: `Given a valid email and a password, it creates an account for an anonymous user.`,
  })
  @ApiCreatedResponse({description: 'User successfully created.'})
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
  @ApiOkResponse({description: 'User successfully signed in.'})
  @ApiUnprocessableEntityResponse({ description: 'Email or password invalid.' })
  @ApiForbiddenResponse({ description: 'Wrong password provided.' })
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

  @Patch('users/:userId/verify')
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify user email with a verification code sent by email.',
    description: `Once a user signed up, he receives a verification code which he should provide to verify its email.`,
  })
  @ApiOkResponse({description: 'User successfully verified email.'})
  @ApiUnprocessableEntityResponse({ description: 'UserId or verification code are in an invalid fromat.' })
  @ApiNotFoundResponse({ description: 'The user do no exist.'})
  @ApiUnauthorizedResponse({ description: 'The token provided is invalid.' })
  @ApiUnauthorizedResponse({ description: 'The verification code do not match the one sent to user.' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The id of the user', example: '00000000-0000-0000-0000-000000000000' })
  async verifyEmail(@Param('userId') userId: string, @Body() verifyEmailRequestDto: VerifyEmailRequestDto): Promise<void> {
    const errorMap = {
      default: new InternalServerErrorException('Something wrong happened'),
    };

    const task = pipe(this.identityAndAccessController.verifyEmail(userId, verifyEmailRequestDto.verification_code),
      convertToHttpErrorToPreventLeak(errorMap, this.logger))

    return await executeTask(task)
  }
}
