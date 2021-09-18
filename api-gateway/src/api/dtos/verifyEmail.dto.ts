import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";

export class VerifyEmailRequestDto {
    @ApiProperty({
        description: 'A verification code.',
        example: '1234',
        required: true,
      })
      verification_code!: string;
}