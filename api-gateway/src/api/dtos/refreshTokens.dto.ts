import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokensRequestDto {
    @ApiProperty({
      description: 'A refresh token.',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...',
      required: true,
    })
    refresh_token!: string;
}

export class RefreshTokensResponseDto {
    @ApiProperty({
      description: 'Access token used to grant access to protected endpoints.',
      example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...',
    })
    access_token!: string;
    @ApiProperty({
      description: 'Refresh token used to get a new access token if it expired.',
      example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...',
    })
    refresh_token!: string;
  }