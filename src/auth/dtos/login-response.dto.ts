import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TokenPayloadT } from '../../tokens/types/token-payload.type';

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
