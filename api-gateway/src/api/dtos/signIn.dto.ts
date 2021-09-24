import { ApiProperty } from '@nestjs/swagger';

export class SignInRequestDto {
  @ApiProperty({
    description: 'A valid email.',
    example: 'myemail@gmail.com',
    required: true,
  })
  email!: string;
  @ApiProperty({
    description: 'A valid password',
    example: 'paSSw0rd!',
    required: true,
  })
  password!: string;
}

export class SignInResponseDto {
  @ApiProperty({
    description: 'Access token used to grant access to protected endpoints.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access_token!: string;
  @ApiProperty({
    description: 'Refresh token used to get a new access token if it expired.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  refresh_token!: string;
}
