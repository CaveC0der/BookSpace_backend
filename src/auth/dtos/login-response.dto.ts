import { TokenPayloadT } from '../../token/types/token-payload.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class LoginResponseDto implements TokenPayloadT {
  @ApiProperty() id: number;
  @ApiProperty() roles: string[];
  @ApiPropertyOptional() admin?: boolean;
  @ApiProperty() username: string;
  @ApiProperty() accessToken: string;

  constructor(payload: TokenPayloadT, username: string, accessToken: string) {
    this.id = payload.id;
    this.roles = payload.roles;
    this.admin = payload.admin;
    this.username = username;
    this.accessToken = accessToken;
  }
}
