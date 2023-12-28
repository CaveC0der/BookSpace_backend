import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginRequestT } from '../types/login-request.type';
import { Cons } from '../../users/user.constraint';

export default class LoginRequestDto implements LoginRequestT {
  @ApiProperty({ example: 'boring@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: Cons.password.min, maxLength: Cons.password.max, example: 'guess-what' })
  @Length(Cons.password.min, Cons.password.max)
  password: string;
}
