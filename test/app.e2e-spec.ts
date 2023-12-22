import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthController } from '../src/auth/auth.controller';
import { UserController } from '../src/user/user.controller';
import { BookController } from '../src/book/book.controller';
import { CommentController } from '../src/comment/comment.controller';
import { GenreController } from '../src/genre/genre.controller';
import { ReviewController } from '../src/review/review.controller';
import { RoleController } from '../src/role/role.controller';
import { AuthService } from '../src/auth/auth.service';
import { BookService } from '../src/book/book.service';
import { CommentService } from '../src/comment/comment.service';
import { FileService } from '../src/file/file.service';
import { ReviewService } from '../src/review/review.service';
import { RoleService } from '../src/role/role.service';
import { TokenService } from '../src/token/token.service';
import { UserService } from '../src/user/user.service';
import { ConfigService } from '../src/config/config.service';
import { loginRequestBody, signupRequestBody } from './data';
import SignupResponseDto from '../src/auth/dtos/signup-response.dto';
import LoginResponseDto from '../src/auth/dtos/login-response.dto';
import { extractCookie } from './helpers';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

describe('App e2e', () => {
  let app: NestExpressApplication;
  let server: any;

  let config: ConfigService;
  let userService: UserService;

  let accessToken: string;
  let cookie: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    config = app.get(ConfigService);
    userService = app.get(UserService);

    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useStaticAssets(config.SERVE_STATIC_PATH, { prefix: config.SERVE_STATIC_PREFIX });

    server = app.getHttpServer();

    await app.init();
  });

  it('all controllers should be defined', () => {
    expect(app.get(AuthController)).toBeDefined();
    expect(app.get(BookController)).toBeDefined();
    expect(app.get(CommentController)).toBeDefined();
    expect(app.get(GenreController)).toBeDefined();
    expect(app.get(ReviewController)).toBeDefined();
    expect(app.get(RoleController)).toBeDefined();
    expect(app.get(UserController)).toBeDefined();
  });

  it('all services should be defined', () => {
    expect(app.get(AuthService)).toBeDefined();
    expect(app.get(BookService)).toBeDefined();
    expect(app.get(CommentService)).toBeDefined();
    expect(config).toBeDefined();
    expect(app.get(FileService)).toBeDefined();
    expect(app.get(ReviewService)).toBeDefined();
    expect(app.get(RoleService)).toBeDefined();
    expect(app.get(TokenService)).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('auth', () => {
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
  });

  afterAll(async () => {
    const user = (await userService.getByEmail(signupRequestBody.email, [{ all: true }]))!;

    await user.token?.destroy();
    await user.destroy({ force: true });

    await app.close();
  });
});
