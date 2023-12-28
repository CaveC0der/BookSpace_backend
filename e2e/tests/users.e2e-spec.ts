// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { adminLoginDto, adminSignupDto, signupDto, userUpdateDto } from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import * as fs from 'fs';
import * as path from 'path';
import RoleModel from '../../src/roles/models/role.model';

describe('Users e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let user: { model: UserModel, accessToken: string };
  let admin: { model: UserModel, accessToken: string };
  let file: Buffer;

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

    let { dto } = await authService.signup(signupDto);
    user = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };
    dto = (await authService.signup(adminSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Admin);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(adminLoginDto)).dto;
    admin = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    file = fs.readFileSync(path.join(__dirname, '../../static/test-img.png'));
  });

  describe('(PUT) /users/me', () => {
    it('success', () => request(server)
      .put('/users/me')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(userUpdateDto)
      .expect(200)
      .expect(async () => {
        user.model = await usersService.safeGetById(user.model.id);
        expect(user.model.username).toBe(userUpdateDto.username);
      }),
    );
  });

  describe('(DELETE) /users/me', () => {
    it('success', () => request(server)
      .delete('/users/me')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(user.model.id)).resolves.toBeNull();
        await usersService.restore(user.model.id);
      }),
    );
  });

  describe('(POST) /users/me/avatar', () => {
    it('success', () => request(server)
      .post('/users/me/avatar')
      .set('authorization', `Bearer ${user.accessToken}`)
      .attach('img', file, 'test-img.png')
      .expect(201),
    );
  });

  describe('(DELETE) /users/me/avatar', () => {
    it('success', () => request(server)
      .delete('/users/me/avatar')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200),
    );
  });

  describe('(GET) /users/:id', () => {
    it('success', () => request(server)
      .get(`/users/${user.model.id}`)
      .expect(200)
      .expect(({ body }: { body: UserModel }) => {
        expect(body.email).toBe(user.model.email);
      }),
    );
  });

  describe('(DELETE) /users/:id', () => {
    it('success', () => request(server)
      .delete(`/users/${user.model.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(user.model.id)).resolves.toBeNull();
      }),
    );
  });

  describe('(POST) /users/:id', () => {
    it('success', () => request(server)
      .post(`/users/${user.model.id}`)
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

  describe('(DELETE) /users/:id/avatar', () => {
    beforeAll(async () => {
      await usersService.setAvatar(user.model.id, {
        buffer: file,
        originalname: 'test-img.png',
      } as Express.Multer.File);
    });

    it('success', () => request(server)
      .delete(`/users/${user.model.id}/avatar`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        const avatar = (await usersService.safeGetById(user.model.id)).avatar;
        expect(avatar).toBeNull();
      }),
    );
  });

  describe('(POST) /users/:id/roles', () => {
    it('success', () => request(server)
      .post(`/users/${user.model.id}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        const roles = (await usersService.safeGetById(user.model.id, [RoleModel])).roles.map(r => r.name);
        expect(roles).toContain(Role.Author);
      }),
    );
  });

  describe('(DELETE) /users/:id/roles', () => {
    it('success', () => request(server)
      .delete(`/users/${user.model.id}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        const roles = (await usersService.safeGetById(user.model.id, [RoleModel])).roles.map(r => r.name);
        expect(roles).toEqual([Role.Reader]);
      }),
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
