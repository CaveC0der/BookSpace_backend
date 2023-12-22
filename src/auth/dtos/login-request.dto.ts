import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginRequestT } from '../types/login-request.type';

export default class LoginRequestDto implements LoginRequestT {
  @ApiProperty({ example: 'boring@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 64, example: 'guess-what' })
  @Length(8, 64)
  password: string;
}
