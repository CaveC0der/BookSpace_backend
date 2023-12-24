import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import TokenModel from './token.model';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';
import { TokenPayloadT } from './types/token-payload.type';
import { Role } from '../roles/role.enum';

@Injectable()
export class TokensService {
  static readonly TOKEN_TYPE = 'Bearer';

  constructor(@InjectModel(TokenModel)
              private tokenRepo: typeof TokenModel,
              private config: ConfigService,
              private jwtService: JwtService) {}

  extractAccessToken(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === TokensService.TOKEN_TYPE ? token : undefined;
  }

  extractRefreshToken(req: Request): string | undefined {
    return req.cookies[this.config.COOKIE_NAME];
  }

  async genAccessToken(payload: TokenPayloadT) {
    return this.jwtService.signAsync(payload, {
      algorithm: this.config.JWT_ALGORITHM,
      secret: this.config.JWT_ACCESS_SECRET,
      expiresIn: this.config.JWT_ACCESS_EXPIRES_IN,
    });
  }

  async genRefreshToken(payload: TokenPayloadT) {
    return this.jwtService.signAsync(payload, {
      algorithm: this.config.JWT_ALGORITHM,
      secret: this.config.JWT_REFRESH_SECRET,
      expiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
    });
  }

  async deleteRefreshToken(id: number) {
    const destroyed = await this.tokenRepo.destroy({ where: { userId: id } });
    if (!destroyed) {
      Logger.error(`deleteRefreshToken(${id}) failed`, TokensService.name);
      throw new NotFoundException();
    }
  }

  async verifyToken(token: string, type: 'ACCESS' | 'REFRESH'): Promise<TokenPayloadT | undefined> {
    try {
      const payload: TokenPayloadT = await this.jwtService.verifyAsync(token, {
        algorithms: [this.config.JWT_ALGORITHM],
        secret: this.config[`JWT_${type}_SECRET`],
      });
      payload.admin = payload.roles.includes(Role.Admin);
      return payload;
    } catch {
      return;
    }
  }
}
