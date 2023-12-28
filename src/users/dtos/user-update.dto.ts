import { IsEmail, IsOptional, Length } from 'class-validator';
import { UserUpdateT } from '../types/user-update.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Cons } from '../user.constraint';

export default class UserUpdateDto implements UserUpdateT {
  @ApiPropertyOptional({ minLength: Cons.username.min, maxLength: Cons.username.max, example: 'Well-known' })
  @IsOptional()
  @Length(Cons.username.min, Cons.username.max)
  username?: string;

  @ApiPropertyOptional({ example: 'boring@mail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: Cons.password.min, maxLength: Cons.password.max, example: 'guess-what' })
  @IsOptional()
  @Length(Cons.password.min, Cons.password.max)
  password?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: Cons.bio, example: 'Sleepy...' })
  @IsOptional()
  @Length(1, Cons.bio)
  bio?: string;
}
