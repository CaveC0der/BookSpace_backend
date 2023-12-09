import LoginResponseDto from './login-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TokenPayloadT } from '../../token/types/token-payload.type';

export default class SignupResponseDto implements Omit<LoginResponseDto, 'username'> {
  @ApiProperty() id: number;
  @ApiProperty() roles: string[];
  @ApiPropertyOptional() admin?: boolean;
  @ApiProperty() accessToken: string;

  constructor(payload: TokenPayloadT, accessToken: string) {
    this.id = payload.id;
    this.roles = payload.roles;
    this.admin = payload.admin;
    this.accessToken = accessToken;
  }
}
