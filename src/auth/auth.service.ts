import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserCreationT } from '../user/types/user-creation.type';
import * as bcryptjs from 'bcryptjs';
import { TokenService } from '../token/token.service';
import RoleModel from '../role/role.model';
import TokenModel from '../token/token.model';
import { ConfigService } from '../config/config.service';
import { TokenPayloadT } from '../token/types/token-payload.type';
import SignupResponseDto from './dtos/signup-response.dto';
import LoginResponseDto from './dtos/login-response.dto';
import LoginRequestDto from './dtos/login-request.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService,
              private config: ConfigService,
              private tokenService: TokenService) {}

  async signup(dto: UserCreationT) {
    if (await this.userService.getByEmail(dto.email))
      throw new BadRequestException('user already exists');

    dto.password = await bcryptjs.hash(dto.password, this.config.SALT_LENGTH);
    const user = await this.userService.create(dto);
    const roles = await user.$get('roles');
    const payload: TokenPayloadT = { id: user.id, roles: roles.map(role => role.name) };
    const accessToken = await this.tokenService.genAccessToken(payload);
    const refreshToken = await this.tokenService.genRefreshToken(payload);
    await user.$create('token', { value: refreshToken });

    return { dto: new SignupResponseDto(payload, accessToken), refreshToken };
  }

  async login(dto: LoginRequestDto) {
    const user = await this.userService.safeGetByEmail(dto.email, [RoleModel, TokenModel]);

    if (!await bcryptjs.compare(dto.password, user.password))
      throw new BadRequestException('invalid password');

    const payload: TokenPayloadT = { id: user.id, roles: user.roles.map(role => role.name) };
    const accessToken = await this.tokenService.genAccessToken(payload);
    const refreshToken = await this.tokenService.genRefreshToken(payload);
    if (!user.token)
      await user.$create('token', { value: refreshToken });
    else
      await user.token.update({ value: refreshToken });

    return { dto: new LoginResponseDto(payload, user.username, accessToken), refreshToken };
  }

  async refresh(id: number, token: string) {
    const user = await this.userService.safeGetById(id, [TokenModel, RoleModel]);

    if (!user.token || user.token.value !== token)
      throw new UnauthorizedException();

    const payload: TokenPayloadT = { id: user.id, roles: user.roles.map(role => role.name) };
    const accessToken = await this.tokenService.genAccessToken(payload);
    const refreshToken = await this.tokenService.genRefreshToken(payload);
    await user.token.update({ value: refreshToken });

    return { dto: new LoginResponseDto(payload, user.username, accessToken), refreshToken };
  }

  async logout(id: number) {
    await this.tokenService.deleteRefreshToken(id);
  }
}
