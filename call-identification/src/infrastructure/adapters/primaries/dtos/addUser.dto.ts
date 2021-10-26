import { ApiProperty } from '@nestjs/swagger';

export class AddUserDto {
  @ApiProperty({ example: '4' })
  id!: string;

  @ApiProperty({ example: 'Luke' })
  firstName!: string;

  @ApiProperty({ example: 'SkyWalker' })
  lastName!: string;

  @ApiProperty({ example: 'an image url' })
  avatarUrl!: string;

  @ApiProperty({ example: '+33607395615' })
  phoneNumber!: string;

  @ApiProperty({ example: 'Ardian' })
  company!: string;

  @ApiProperty({ example: "It's always better to have some notes !" })
  notes!: string;
}
