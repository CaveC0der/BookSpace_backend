import { IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignupRequestT } from '../types/signup-request.type';

export default class SignupRequestDto implements SignupRequestT {
  @ApiProperty({ minLength: 1, maxLength: 64, example: 'Well-known' })
  @Length(1, 64)
  username: string;

  @ApiProperty({ example: 'boring@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 64, example: 'guess-what' })
  @Length(8, 64)
  password: string;
}
