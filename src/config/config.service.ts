import { Injectable } from '@nestjs/common';
import { ConfigService as DefaultConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ThrottlerOptions } from '@nestjs/throttler';
import { join, normalize } from 'path';
import { Algorithm } from 'jsonwebtoken';

@Injectable()
export class ConfigService {
  constructor(private defaultConfigService: DefaultConfigService) {}

  get PORT(): number {
    return this.defaultConfigService.getOrThrow('PORT');
  }

  get SEQUELIZE_OPTIONS(): SequelizeModuleOptions {
    return {
      dialect: this.defaultConfigService.getOrThrow('DB_DIALECT'),
      host: this.defaultConfigService.getOrThrow('DB_HOST'),
      port: this.defaultConfigService.getOrThrow('DB_PORT'),
      username: this.defaultConfigService.getOrThrow('DB_USERNAME'),
      password: this.defaultConfigService.getOrThrow('DB_PASSWORD'),
      database: this.defaultConfigService.getOrThrow('DB_NAME'),
    };
  }

  get COOKIE_NAME(): string {
    return this.defaultConfigService.getOrThrow('COOKIE_NAME');
  }

  get COOKIE_MAX_AGE(): number {
    return this.defaultConfigService.getOrThrow('COOKIE_MAX_AGE');
  }

  get SALT_LENGTH(): number {
    return this.defaultConfigService.getOrThrow('SALT_LENGTH');
  }

  get JWT_ALGORITHM(): Algorithm {
    return this.defaultConfigService.getOrThrow('JWT_ALGORITHM');
  }

  get JWT_ACCESS_SECRET(): string {
    return this.defaultConfigService.getOrThrow('JWT_ACCESS_SECRET');
  }

  get JWT_ACCESS_EXPIRES_IN(): string {
    return this.defaultConfigService.getOrThrow('JWT_ACCESS_EXPIRES_IN');
  }

  get JWT_REFRESH_SECRET(): string {
    return this.defaultConfigService.getOrThrow('JWT_REFRESH_SECRET');
  }

  get JWT_REFRESH_EXPIRES_IN(): string {
    return this.defaultConfigService.getOrThrow('JWT_REFRESH_EXPIRES_IN');
  }

  get SERVE_STATIC_PATH(): string {
    return normalize(join(__dirname, '..', '..', this.defaultConfigService.getOrThrow('SERVE_STATIC_FOLDER')));
  }

  get SERVE_STATIC_PREFIX(): string {
    return '/' + this.defaultConfigService.getOrThrow('SERVE_STATIC_PREFIX');
  }

  get THROTTLER_OPTIONS(): ThrottlerOptions {
    return {
      ttl: +this.defaultConfigService.getOrThrow('THROTTLER_TTL'),
      limit: +this.defaultConfigService.getOrThrow('THROTTLER_LIMIT'),
    };
  };
}
