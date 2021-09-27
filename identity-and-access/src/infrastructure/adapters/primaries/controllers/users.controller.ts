import { executeTask } from '@common/utils/executeTask';
import { VerifyEmail } from '@identity-and-access/application/commands/verifyEmail.command';
import { AuthenticationGuard } from '@identity-and-access/infrastructure/adapters/primaries/guards/authentication.guard';
import { Body, Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { tryCatch } from 'fp-ts/lib/TaskEither';
import { VerifyEmailRequestDto } from '../dtos/verifyEmail.dto';

@Controller('v1/users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly commandBus: CommandBus) { }
    @Patch(':userId/contact-information/email')
    @ApiBearerAuth()
    @UseGuards(AuthenticationGuard)
    @HttpCode(200)
    @ApiOperation({
        summary: 'Verify user email with a verification code sent by email.',
        description: `Once a user signed up, he receives a verification code which he should provide to verify its email.`,
    })
    @ApiOkResponse({ description: 'User successfully verified email.' })
    @ApiUnprocessableEntityResponse({ description: 'UserId or verification code are in an invalid fromat.' })
    @ApiNotFoundResponse({ description: 'The user do no exist.' })
    @ApiUnauthorizedResponse({ description: 'The token provided is invalid.' })
    @ApiUnauthorizedResponse({ description: 'The verification code do not match the one sent to user.' })
    @ApiParam({ name: 'userId', type: 'string', description: 'The id of the user', example: '00000000-0000-0000-0000-000000000000' })
    async verifyEmail(@Param('userId') userId: string, @Body() verifyEmailRequestDto: VerifyEmailRequestDto): Promise<void> {
        const verifyEmailTask = tryCatch(
            async () => {
                const command = new VerifyEmail(userId, verifyEmailRequestDto.verification_code);
                return await this.commandBus.execute<VerifyEmail>(command);
            },
            (reason: unknown) => reason as Error,
        )

        return await executeTask(verifyEmailTask)
    }
}
