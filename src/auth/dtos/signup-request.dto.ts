import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignupRequestT } from '../types/signup-request.type';
import { Cons } from '../../users/user.constraint';

export default class SignupRequestDto implements SignupRequestT {
  @ApiProperty({ minLength: Cons.username.min, maxLength: Cons.username.max, example: 'Well-known' })
  @Length(Cons.username.min, Cons.username.max)
  username: string;

  @ApiProperty({ example: 'boring@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: Cons.password.min, maxLength: Cons.password.max, example: 'guess-what' })
  @Length(Cons.password.min, Cons.password.max)
  password: string;
}
