// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../src/config/config.service';
import { loginRequestBody, signupRequestBody } from './data';
import SignupResponseDto from '../src/auth/dtos/signup-response.dto';
import LoginResponseDto from '../src/auth/dtos/login-response.dto';
import { extractCookie } from './helpers';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { UsersService } from '../src/users/users.service';

describe('Auth e2e', () => {
  let app: NestExpressApplication;
  let server: Server;

  let config: ConfigService;
  let usersService: UsersService;

  let accessToken: string;
  let cookie: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    config = app.get(ConfigService);
    usersService = app.get(UsersService);

    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useStaticAssets(config.SERVE_STATIC_PATH, { prefix: config.SERVE_STATIC_PREFIX });

    server = app.getHttpServer();

    await app.init();
  });

  describe('(POST) /auth/signup', () => {
    it('normal', () => request(server)
      .post('/auth/signup')
      .send(signupRequestBody)
      .expect(201)
      .expect(({ body, header }: { body: SignupResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('Reader');
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
      }),
    );
  });

  describe('(POST) /auth/login', () => {
    it('normal', () => request(server)
      .post('/auth/login')
      .send(loginRequestBody)
      .expect(201)
      .expect(({ body, header }: { body: LoginResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('Reader');
        expect(body.username).toBe(signupRequestBody.username);
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
      }),
    );
  });

  describe('(PUT) /auth/refresh', () => {
    it('normal', () => request(server)
      .put('/auth/refresh')
      .set('cookie', cookie)
      .expect(200)
      .expect(({ body, header }: { body: LoginResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('Reader');
        expect(body.username).toBe(signupRequestBody.username);
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
      }),
    );
  });

  describe('(DELETE) /auth/logout', () => {
    it('normal', () => request(server)
      .delete('/auth/logout')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ header }: { header: any }) => (extractCookie(config.COOKIE_NAME, header['set-cookie']) === '')),
    );
  });

  afterAll(async () => {
    const user = await usersService.safeGetByEmail(signupRequestBody.email, [{ all: true }]);

    await user.token?.destroy();
    await user.destroy({ force: true });

    await app.close();
  });
});
