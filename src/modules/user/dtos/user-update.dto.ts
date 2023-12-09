import { IsEmail, IsOptional, Length } from 'class-validator';
import { UserUpdateT } from '../types/user-update.type';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class UserUpdateDto implements UserUpdateT {
  @ApiPropertyOptional({ minLength: 1, maxLength: 64, example: 'Well-known' })
  @IsOptional()
  @Length(1, 64)
  username?: string;

  @ApiPropertyOptional({ example: 'boring@mail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: 8, maxLength: 64, example: 'guess-what' })
  @IsOptional()
  @Length(8, 64)
  password?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 500, example: 'Sleepy...' })
  @IsOptional()
  @Length(1, 500)
  bio?: string;
}
