import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
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
