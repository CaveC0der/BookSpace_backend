// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { adminLoginRequestBody, adminSignupRequestBody, signupRequestBody, userUpdateRequestDto } from './data';
import * as request from 'supertest';
import { AuthService } from '../src/auth/auth.service';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../src/users/users.service';
import UserModel from '../src/users/user.model';
import { Role } from '../src/roles/role.enum';

describe('User e2e', () => {
  let app: NestExpressApplication;
  let server: Server;

  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;

  let user: { model: UserModel, accessToken: string };
  let admin: { model: UserModel, accessToken: string };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    config = app.get(ConfigService);
    authService = app.get(AuthService);
    usersService = app.get(UsersService);

    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useStaticAssets(config.SERVE_STATIC_PATH, { prefix: config.SERVE_STATIC_PREFIX });

    server = app.getHttpServer();

    await app.init();

    let { dto } = await authService.signup(signupRequestBody);
    user = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(adminSignupRequestBody)).dto;
    await usersService.addRole(dto.id, Role.Admin);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(adminLoginRequestBody)).dto;
    admin = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };
  });

  describe('(GET) /user/:id', () => {
    it('normal', () => request(server)
      .get(`/user/${user.model.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UserModel }) => {
        expect(body.email).toBe(user.model.email);
      }),
    );
  });

  describe('(PUT) /user', () => {
    it('normal', () => request(server)
      .put('/user')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(userUpdateRequestDto)
      .expect(200)
      .expect(async () => {
        user.model = await usersService.safeGetById(user.model.id);

        expect(user.model.username).toBe(userUpdateRequestDto.username);
      }),
    );
  });

  describe('(DELETE) /user', () => {
    it('normal', () => request(server)
      .delete('/user')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(user.model.id)).resolves.toBeNull();
        await usersService.restore(user.model.id);
      }),
    );
  });

  describe('(DELETE) /user/:id', () => {
    it('normal', () => request(server)
      .delete(`/user/${user.model.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(user.model.id)).resolves.toBeNull();
      }),
    );
  });

  describe('(POST) /user/:id', () => {
    it('normal', () => request(server)
      .post(`/user/${user.model.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        const candidate = await usersService.getById(user.model.id);
        expect(candidate).toBeInstanceOf(UserModel);
        if (candidate)
          user.model = candidate;
      }),
    );
  });

  describe('(POST) /user/my/avatar', () => {
    it('normal', () => {
        const file = fs.readFileSync(path.join(__dirname, '../static/test-img.png'));
        return request(server)
          .post('/user/my/avatar')
          .set('authorization', `Bearer ${user.accessToken}`)
          .attach('img', file, 'test-img.png')
          .expect(201);
      },
    );
  });

  describe('(DELETE) /user/my/avatar', () => {
    it('normal', () => {
        return request(server)
          .delete('/user/my/avatar')
          .set('authorization', `Bearer ${user.accessToken}`)
          .expect(200);
      },
    );
  });

  afterAll(async () => {
    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await app.close();
  });
});
