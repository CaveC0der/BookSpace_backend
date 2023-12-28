// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { adminLoginDto, adminSignupDto, roleUpdateDto } from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import RoleModel from '../../src/roles/models/role.model';
import { RolesService } from '../../src/roles/roles.service';

describe('Roles e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let rolesService: RolesService;
  let admin: { model: UserModel, accessToken: string };

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
  });

  describe('(GET) /roles', () => {
    it('success', () => request(server)
      .get('/roles')
      .expect(200)
      .expect(({ body }: { body: RoleModel[] }) => {
        const roles = body.map(r => r.name);
        expect(roles).toEqual(['Reader', 'Author', 'Admin']);
      }),
    );
  });

  describe('(GET) /roles/:id', () => {
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
    it('success', () => request(server)
      .put(`/roles/${Role.Admin}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(roleUpdateDto)
      .expect(200)
      .expect(async () => {
        expect((await rolesService.get(Role.Admin)).description).toBe(roleUpdateDto.description);
      }),
    );
  });

  describe('(GET) /roles/:id/users', () => {
    it('success', () => request(server)
      .get(`/roles/${Role.Admin}/users`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(u => u.id)).toContain(admin.model.id);
      }),
    );
  });

  afterAll(async () => {
    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await app.close();
  });
});
