// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { adminLoginDto, adminSignupDto, roleUpdateDto, signupDto } from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import RoleModel from '../../src/roles/models/role.model';
import { RolesService } from '../../src/roles/roles.service';
import { AccessUserModel } from '../types';
import { RoleUpdateT } from '../../src/roles/types/role-update.type';
import UsersQueryDto from '../../src/users/dtos/users-query.dto';

describe('Roles e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let rolesService: RolesService;
  let admin: AccessUserModel;
  let user: AccessUserModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    config = app.get(ConfigService);
    authService = app.get(AuthService);
    usersService = app.get(UsersService);
    rolesService = app.get(RolesService);

    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useStaticAssets(config.SERVE_STATIC_PATH, { prefix: config.SERVE_STATIC_PREFIX });

    server = app.getHttpServer();

    await app.init();

    let { dto } = await authService.signup(adminSignupDto);
    await usersService.addRole(dto.id, Role.Admin);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(adminLoginDto)).dto;
    admin = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(signupDto)).dto;
    user = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };
  });

  describe('(GET) /roles', () => {
    it('success', () => request(server)
      .get('/roles')
      .expect(200)
      .expect(({ body }: { body: RoleModel[] }) => {
        const roles = body.map(r => r.name).sort();
        expect(roles).toEqual(['Admin', 'Author', 'Restricted', 'User']);
      }),
    );
  });

  describe('(GET) /roles/:id', () => {
    it('invalid role', () => request(server)
      .get('/roles/does-not-exist')
      .expect(400),
    );

    it('success', () => request(server)
      .get(`/roles/${Role.Admin}`)
      .expect(200)
      .expect(({ body }: { body: RoleModel }) => {
        expect(body).toHaveProperty('description');
        expect(body.name).toBe(Role.Admin);
      }),
    );
  });

  describe('(PUT) /roles/:id', () => {
    it('not an admin', () => request(server)
      .put(`/roles/${Role.Restricted}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(roleUpdateDto)
      .expect(403),
    );

    it('invalid role', () => request(server)
      .put('/roles/does-not-exist')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(roleUpdateDto)
      .expect(400),
    );

    it('invalid data', () => request(server)
      .put(`/roles/${Role.Admin}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({ description: '' } as RoleUpdateT)
      .expect(400),
    );

    it('success', () => request(server)
      .put(`/roles/${Role.Admin}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(roleUpdateDto)
      .expect(200)
      .expect(async () => {
        expect((await rolesService.get(Role.Admin)).description).toBe(roleUpdateDto.description);
      }),
    );

    afterAll(async () => {
      await rolesService.update(Role.Admin, null!);
    });
  });

  describe('(GET) /roles/:id/users', () => {
    it('invalid role', () => request(server)
      .get('/roles/does-not-exist/users')
      .expect(400),
    );

    it('success', () => request(server)
      .get(`/roles/${Role.Admin}/users`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const _user = body.find(u => u.id === admin.model.id);
        expect(_user).toBeDefined();
        expect(_user!.roles).toBeUndefined();
      }),
    );

    it('success with eager loading', () => request(server)
      .get(`/roles/${Role.Admin}/users`)
      .query({ eager: true } as UsersQueryDto)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const _user = body.find(u => u.id === admin.model.id);
        expect(_user).toBeDefined();
        expect(_user!.roles).toBeInstanceOf(Array);
      }),
    );
  });

  afterAll(async () => {
    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await app.close();
  });
});
