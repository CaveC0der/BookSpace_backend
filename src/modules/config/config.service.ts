import { Injectable } from '@nestjs/common';
import { ConfigService as DefaultConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { join } from 'path';
import { ThrottlerOptions } from '@nestjs/throttler';

@Injectable()
export class ConfigService {
  readonly PORT: number;
  readonly DB: SequelizeModuleOptions;
  readonly COOKIE_NAME: string;
  readonly COOKIE_MAX_AGE: number;
  readonly HASH_PASSWORD_SALT: number;
  readonly JWT_ALGORITHM: Algorithm;
  readonly JWT_ACCESS: { readonly SECRET: string, readonly EXPIRES_IN: string };
  readonly JWT_REFRESH: { readonly SECRET: string, readonly EXPIRES_IN: string };
  readonly SERVE_STATIC: { readonly PATH: string, readonly PREFIX: string };
  readonly THROTTLER: ThrottlerOptions;

  constructor(private defaultConfigService: DefaultConfigService) {
    this.PORT = this.defaultConfigService.getOrThrow('PORT');

    this.DB = {
      dialect: this.defaultConfigService.getOrThrow('DB_DIALECT'),
      host: this.defaultConfigService.getOrThrow('DB_HOST'),
      port: this.defaultConfigService.getOrThrow('DB_PORT'),
      username: this.defaultConfigService.getOrThrow('DB_USERNAME'),
      password: this.defaultConfigService.getOrThrow('DB_PASSWORD'),
      database: this.defaultConfigService.getOrThrow('DB_DATABASE'),
    };

    this.COOKIE_NAME = this.defaultConfigService.getOrThrow('COOKIE_NAME');
    this.COOKIE_MAX_AGE = this.defaultConfigService.getOrThrow('COOKIE_MAX_AGE');

    this.HASH_PASSWORD_SALT = +this.defaultConfigService.getOrThrow('HASH_PASSWORD_SALT');

    this.JWT_ALGORITHM = this.defaultConfigService.getOrThrow('JWT_ALGORITHM');
    this.JWT_ACCESS = {
      SECRET: this.defaultConfigService.getOrThrow('JWT_ACCESS_SECRET'),
      EXPIRES_IN: this.defaultConfigService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    };
    this.JWT_REFRESH = {
      SECRET: this.defaultConfigService.getOrThrow('JWT_REFRESH_SECRET'),
      EXPIRES_IN: this.defaultConfigService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    };
    this.SERVE_STATIC = {
      PATH: join(__dirname, '../../..', this.defaultConfigService.getOrThrow('STATIC_FOLDER')),
      PREFIX: this.defaultConfigService.getOrThrow('STATIC_PREFIX'),
    };

    this.THROTTLER = {
      ttl: +this.defaultConfigService.getOrThrow('THROTTLER_TTL'),
      limit: +this.defaultConfigService.getOrThrow('THROTTLER_LIMIT'),
    };
  }
}
