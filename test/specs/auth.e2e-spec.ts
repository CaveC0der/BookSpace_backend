// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import { loginDto, signupDto } from '../data';
import SignupResponseDto from '../../src/auth/dtos/signup-response.dto';
import LoginResponseDto from '../../src/auth/dtos/login-response.dto';
import { extractCookie, signToken } from '../helpers';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { UsersService } from '../../src/users/users.service';
import { SignupRequestT } from '../../src/auth/types/signup-request.type';
import { LoginRequestT } from '../../src/auth/types/login-request.type';

describe('Auth e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let usersService: UsersService;
  let accessToken: string;
  let cookie: string;
  let credentials: SignupResponseDto;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(ConfigService).useValue(config).compile();

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
    it('invalid data', () => request(server)
      .post('/auth/signup')
      .send({ username: '', email: 'not_an_email', password: 'short' } as SignupRequestT)
      .expect(400),
    );

    it('success', () => request(server)
      .post('/auth/signup')
      .send(signupDto)
      .expect(201)
      .expect(({ body, header }: { body: SignupResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('User');
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
        credentials = body;
      }),
    );

    it('user already exists', () => request(server)
      .post('/auth/signup')
      .send(signupDto)
      .expect(400),
    );
  });

  describe('(POST) /auth/login', () => {
    it('invalid data', () => request(server)
      .post('/auth/login')
      .send({ email: 'not_an_email', password: 'short' } as LoginRequestT)
      .expect(400),
    );

    it('user does not exist', () => request(server)
      .post('/auth/login')
      .send({ email: 'unknown@mail.com', password: 'e2e-secret' } as LoginRequestT)
      .expect(404),
    );

    it('invalid password', () => request(server)
      .post('/auth/login')
      .send({ email: 'e2e@mail.com', password: 'e2e-password' } as LoginRequestT)
      .expect(400),
    );

    it('success', () => request(server)
      .post('/auth/login')
      .send(loginDto)
      .expect(201)
      .expect(({ body, header }: { body: LoginResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('User');
        expect(body.username).toBe(signupDto.username);
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
      }),
    );
  });

  describe('(PUT) /auth/refresh', () => {
    it('without refresh token', () => request(server)
      .post('/auth/refresh')
      .expect(401),
    );

    it('invalid refresh token', () => request(server)
      .post('/auth/refresh')
      .set('cookie', cookie.slice(0, -5))
      .expect(401),
    );

    it('refresh token does not equal token in db', () => request(server)
      .post('/auth/refresh')
      .set('cookie', `${config.COOKIE_NAME}=${signToken({
        id: credentials.id,
        roles: credentials.roles,
      }, config.JWT_REFRESH_SECRET, config.JWT_ALGORITHM, '1h')}`)
      .expect(401),
    );

    it('success', () => request(server)
      .post('/auth/refresh')
      .set('cookie', cookie)
      .expect(201)
      .expect(({ body, header }: { body: LoginResponseDto, header: any }) => {
        expect(typeof body.id).toBe('number');
        expect(body.admin).toBeFalsy();
        expect(body.roles).toContain('User');
        expect(body.username).toBe(signupDto.username);
        expect(typeof body.accessToken).toBe('string');

        accessToken = body.accessToken;
        cookie = extractCookie(config.COOKIE_NAME, header['set-cookie']);
      }),
    );
  });

  describe('(DELETE) /auth/logout', () => {
    it('without access token', () => request(server)
      .delete('/auth/logout')
      .expect(401),
    );

    it('invalid access token', () => request(server)
      .delete('/auth/logout')
      .set('authorization', `Bearer ${accessToken.slice(0, -5)}`)
      .expect(401),
    );

    it('success', () => request(server)
      .delete('/auth/logout')
      .set('authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ header }: { header: any }) => (extractCookie(config.COOKIE_NAME, header['set-cookie']) === '')),
    );
  });

  afterAll(async () => {
    const user = await usersService.safeGetByEmail(signupDto.email, [{ all: true }]);

    await user.token?.destroy();
    await user.destroy({ force: true });

    await app.close();
  });
});
