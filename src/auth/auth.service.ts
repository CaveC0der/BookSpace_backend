import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '../config/config.service';
import SignupResponseDto from './dtos/signup-response.dto';
import LoginResponseDto from './dtos/login-response.dto';
import LoginRequestDto from './dtos/login-request.dto';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { UserCreationT } from '../users/types/user-creation.type';
import { TokenPayloadT } from '../tokens/types/token-payload.type';
import RoleModel from '../roles/models/role.model';
import TokenModel from '../tokens/token.model';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              private config: ConfigService,
              private tokensService: TokensService) {}

  async signup(dto: UserCreationT) {
    dto.password = await bcryptjs.hash(dto.password, this.config.SALT_LENGTH);

    const [user, created] = await this.usersService.getCreateGet(dto);
    if (!created) {
      throw new BadRequestException('user already exists');
    }

    const roles = await user.$get('roles');
    const payload: TokenPayloadT = { id: user.id, roles: roles.map(role => role.name) };
    const { accessToken, refreshToken } = await this.tokensService.genTokens(payload);
    await user.$create('token', { value: refreshToken });

    return { dto: new SignupResponseDto(payload, accessToken), refreshToken };
  }

  async login(dto: LoginRequestDto) {
    const user = await this.usersService.safeGetByEmail(dto.email, [RoleModel, TokenModel]);

    if (!await bcryptjs.compare(dto.password, user.password)) {
      throw new BadRequestException('invalid password');
    }

    const payload: TokenPayloadT = { id: user.id, roles: user.roles.map(role => role.name) };
    const { accessToken, refreshToken } = await this.tokensService.genTokens(payload);
    if (!user.token) {
      await user.$create('token', { value: refreshToken });
    } else {
      await user.token.update({ value: refreshToken });
    }

    return { dto: new LoginResponseDto(payload, user.username, accessToken), refreshToken };
  }

  async refresh(id: number, token: string) {
    const user = await this.usersService.safeGetById(id, [TokenModel, RoleModel]);

    if (!user.token || user.token.value !== token) {
      throw new UnauthorizedException();
    }

    const payload: TokenPayloadT = { id: user.id, roles: user.roles.map(role => role.name) };
    const { accessToken, refreshToken } = await this.tokensService.genTokens(payload);
    await user.token.update({ value: refreshToken });

    return { dto: new LoginResponseDto(payload, user.username, accessToken), refreshToken };
  }

  async logout(id: number) {
    await this.tokensService.deleteRefreshToken(id);
  }
}
