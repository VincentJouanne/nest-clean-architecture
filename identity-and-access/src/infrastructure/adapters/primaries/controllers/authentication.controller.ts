import { executeTask } from '@common/utils/executeTask';
import { RefreshTokens } from '@identity-and-access/application/commands/refreshTokens.command';
import { SignIn } from '@identity-and-access/application/commands/signIn.command';
import { SignUp } from '@identity-and-access/application/commands/signUp.command';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { pipe } from 'fp-ts/lib/function';
import { map, tryCatch } from 'fp-ts/lib/TaskEither';
import { RefreshTokensRequestDto, RefreshTokensResponseDto } from '../dtos/refreshTokens.dto';
import { SignInRequestDto, SignInResponseDto } from '../dtos/signIn.dto';
import { SignUpDto } from '../dtos/signUp.dto';

@Controller('v1/auth')
@ApiTags('Authentication')
export class AuthenticationController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('signup')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Sign up a user by creating an account.',
        description: `Given a valid email and a password, it creates an account for an anonymous user.`,
    })
    @ApiCreatedResponse({ description: 'User successfully created.' })
    @ApiUnprocessableEntityResponse({ description: 'Email or password invalid.' })
    @ApiConflictResponse({ description: 'Email already exists.' })
    async signUp(@Body() signUpDto: SignUpDto): Promise<void> {

        const signUpTask = tryCatch(
            async () => {
                const command = new SignUp(signUpDto.email, signUpDto.password);
                return await this.commandBus.execute<SignUp>(command);
            },
            (reason: unknown) => reason as Error,
        );

        return await executeTask(signUpTask);
    }

    @Post('signin')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Sign in a user by validating its credentials and return him a JWT.',
        description: `Given a valid email and a password of an existing user, it returns a JWT.`,
    })
    @ApiOkResponse({ description: 'User successfully signed in.' })
    @ApiUnprocessableEntityResponse({ description: 'Email or password invalid.' })
    @ApiForbiddenResponse({ description: 'Wrong password provided.' })
    @ApiNotFoundResponse({ description: 'No user associated to the given email.' })
    async signIn(@Body() signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
        const signInTask = pipe(tryCatch(
            async () => {
                const command = new SignIn(signInRequestDto.email, signInRequestDto.password);
                return await this.commandBus.execute<SignIn>(command);
            },
            (reason: unknown) => reason as Error,
        ), map(([accessToken, refreshToken]) => ({
            access_token: accessToken,
            refresh_token: refreshToken
        })));

        return await executeTask(signInTask);
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Refresh authentication tokens.',
        description: `Given a valid refresh token, it returns a pair of access/refresh token.`,
    })
    async refresh(@Body() refreshTokensDto: RefreshTokensRequestDto): Promise<RefreshTokensResponseDto> {
        const refreshTokensTask = pipe(tryCatch(
            async () => {
                const command = new RefreshTokens(refreshTokensDto.refresh_token);
                return await this.commandBus.execute<RefreshTokens>(command);
            },
            (reason: unknown) => reason as Error,
        ), map(([accessToken, refreshToken]) => ({
            access_token: accessToken,
            refresh_token: refreshToken
        })))

        return await executeTask(refreshTokensTask);
    }
}
