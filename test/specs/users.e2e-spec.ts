// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import {
  adminLoginDto,
  adminSignupDto,
  bookCreationDto,
  img,
  restrictedLoginDto,
  restrictedSignupDto,
  signupDto,
  userUpdateDto,
} from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import RoleModel from '../../src/roles/models/role.model';
import { AccessUserModel } from '../types';
import { UserUpdateT } from '../../src/users/types/user-update.type';
import BookModel from '../../src/books/models/book.model';
import { BooksService } from '../../src/books/books.service';
import BooksQueryDto from '../../src/books/dtos/books-query.dto';
import FindUsersQueryDto from '../../src/users/dtos/find-users-query.dto';

describe('Users e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let booksService: BooksService;
  let user: AccessUserModel;
  let admin: AccessUserModel;
  let restricted: AccessUserModel;
  let book: BookModel;
  let nonExistentId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    config = app.get(ConfigService);
    authService = app.get(AuthService);
    usersService = app.get(UsersService);
    booksService = app.get(BooksService);

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

    dto = (await authService.signup(restrictedSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Author);
    await usersService.addRole(dto.id, Role.Restricted);
    dto = (await authService.login(restrictedLoginDto)).dto;
    restricted = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    book = await booksService.create(restricted.model.id, bookCreationDto);
    await booksService.get(book.id, admin.model.id);

    nonExistentId = restricted.model.id + 404;
  });

  describe('(PUT) /users/me', () => {
    it('restricted', () => request(server)
      .put('/users/me')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .send(userUpdateDto)
      .expect(403),
    );

    it('invalid data', () => request(server)
      .put('/users/me')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send({ password: 'short' } as UserUpdateT)
      .expect(400),
    );

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
    it('success - restricted', () => request(server)
      .delete('/users/me')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(restricted.model.id)).resolves.toBeNull();
      }),
    );

    it('success - user', () => request(server)
      .delete('/users/me')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(usersService.getById(user.model.id)).resolves.toBeNull();
      }),
    );

    afterAll(async () => {
      await usersService.restore(restricted.model.id);
      await usersService.restore(user.model.id);
    });
  });

  describe('(POST) /users/me/avatar', () => {
    it('restricted', () => request(server)
      .post('/users/me/avatar')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(403),
    );

    it('filename without extension', () => request(server)
      .post('/users/me/avatar')
      .set('authorization', `Bearer ${user.accessToken}`)
      .attach(img.fieldname, img.buffer, 'test-img')
      .expect(400),
    );

    it('success', () => request(server)
      .post('/users/me/avatar')
      .set('authorization', `Bearer ${user.accessToken}`)
      .attach(img.fieldname, img.buffer, img.originalname)
      .expect(201),
    );
  });

  describe('(DELETE) /users/me/avatar', () => {
    beforeAll(async () => {
      await usersService.setAvatar(restricted.model.id, img);
    });

    it('success - restricted', () => request(server)
      .delete('/users/me/avatar')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200),
    );

    it('success - user', () => request(server)
      .delete('/users/me/avatar')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200),
    );
  });

  describe('(GET) /users/me/books/authored', () => {
    it('not an author', () => request(server)
      .get('/users/me/books/authored')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('success - author without books', () => request(server)
      .get('/users/me/books/authored')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(0);
      }),
    );

    it('success', () => request(server)
      .get('/users/me/books/authored')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const names = body.map(b => b.name);
        expect(names).toContain(bookCreationDto.name);
        const _book = body.find(b => b.name === bookCreationDto.name)!;
        expect(_book.genres).toBeUndefined();
      }),
    );

    it('success with eager loading', () => request(server)
      .get('/users/me/books/authored')
      .query({ eager: true } as BooksQueryDto)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const names = body.map(b => b.name);
        expect(names).toContain(bookCreationDto.name);
        const _book = body.find(b => b.name === bookCreationDto.name)!;
        expect(_book.genres).toBeInstanceOf(Array);
      }),
    );
  });

  describe('(GET) /users/me/books/viewed', () => {
    it('success - no books viewed', () => request(server)
      .get('/users/me/books/viewed')
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(0);
      }),
    );

    it('success', () => request(server)
      .get('/users/me/books/viewed')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const names = body.map(b => b.name);
        expect(names).toContain(bookCreationDto.name);
        const _book = body.find(b => b.name === bookCreationDto.name)!;
        expect(_book.genres).toBeUndefined();
      }),
    );

    it('success with eager loading', () => request(server)
      .get('/users/me/books/viewed')
      .query({ eager: true } as BooksQueryDto)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const names = body.map(b => b.name);
        expect(names).toContain(bookCreationDto.name);
        const _book = body.find(b => b.name === bookCreationDto.name)!;
        expect(_book.genres).toBeInstanceOf(Array);
      }),
    );
  });

  describe('(GET) /users', () => {
    beforeAll(async () => {
      await usersService.delete(restricted.model.id);
    });

    it('not an admin', () => request(server)
      .get('/users')
      .query({ username: 'B', usernameMode: 'startsWith' } as FindUsersQueryDto)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('invalid query', () => request(server)
      .get('/users')
      .query({ orderBy: 'invalidOrder', usernameMode: 'invalidMode' })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(400),
    );

    it('none of users match query', () => request(server)
      .get('/users')
      .query({ username: 'DoesNotExist', usernameMode: 'startsWith' } as FindUsersQueryDto)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(0);
      }),
    );

    it('success', () => request(server)
      .get('/users')
      .query({ email: 'e2e', limit: 10 } as FindUsersQueryDto)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const emails = body.map(u => u.email);
        expect(emails).toContain(signupDto.email);
        expect(emails).not.toContain(restrictedSignupDto.email);
        expect(emails).toContain(adminSignupDto.email);
        const _user = body.find(u => u.email === signupDto.email)!;
        expect(_user.deletedAt).toBeNull();
        expect(_user.roles).toBeUndefined();
      }),
    );

    it('success with eager loading', () => request(server)
      .get('/users')
      .query({ email: 'e2e', limit: 10, eager: true } as FindUsersQueryDto)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const emails = body.map(u => u.email);
        expect(emails).toContain(signupDto.email);
        expect(emails).not.toContain(restrictedSignupDto.email);
        expect(emails).toContain(adminSignupDto.email);
        const _user = body.find(u => u.email === signupDto.email)!;
        expect(_user.deletedAt).toBeNull();
        expect(_user.roles).toBeInstanceOf(Array);
        expect(_user.roles.map(r => r.name)).toContain(Role.User);
      }),
    );

    it('success with paranoid', () => request(server)
      .get('/users')
      .query({ email: 'e2e', limit: 10, eager: true, paranoid: false } as FindUsersQueryDto)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UserModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const emails = body.map(u => u.email);
        expect(emails).toContain(signupDto.email);
        expect(emails).toContain(restrictedSignupDto.email);
        expect(emails).toContain(adminSignupDto.email);
        const _user = body.find(u => u.email === restrictedSignupDto.email)!;
        expect(_user.deletedAt).not.toBeNull();
        expect(_user.roles).toBeInstanceOf(Array);
        expect(_user.roles.map(r => r.name)).toContain(Role.Restricted);
      }),
    );

    afterAll(async () => {
      await usersService.restore(restricted.model.id);
    });
  });

  describe('(GET) /users/:id', () => {
    it('not found', () => request(server)
      .get(`/users/${nonExistentId}`)
      .expect(404),
    );

    it('success', () => request(server)
      .get(`/users/${user.model.id}`)
      .expect(200)
      .expect(({ body }: { body: UserModel }) => {
        expect(body.email).toBe(user.model.email);
      }),
    );
  });

  describe('(DELETE) /users/:id', () => {
    it('not an admin', () => request(server)
      .delete(`/users/${restricted.model.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('not found', () => request(server)
      .delete(`/users/${nonExistentId}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

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
    it('not an admin', () => request(server)
      .post(`/users/${restricted.model.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('not found', () => request(server)
      .post(`/users/${nonExistentId}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

    it('success', () => request(server)
      .post(`/users/${user.model.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        user.model = (await usersService.getById(user.model.id))!;
        expect(user.model).toBeInstanceOf(UserModel);
      }),
    );
  });

  describe('(DELETE) /users/:id/avatar', () => {
    beforeAll(async () => {
      await usersService.setAvatar(user.model.id, img);
    });

    it('not an admin', () => request(server)
      .delete(`/users/${restricted.model.id}/avatar`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('not found', () => request(server)
      .delete(`/users/${nonExistentId}/avatar`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

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
    it('not an admin', () => request(server)
      .post(`/users/${restricted.model.id}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('not found', () => request(server)
      .post(`/users/${nonExistentId}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

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
    it('not an admin', () => request(server)
      .delete(`/users/${restricted.model.id}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('not found', () => request(server)
      .delete(`/users/${nonExistentId}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

    it('success', () => request(server)
      .delete(`/users/${user.model.id}/roles`)
      .query({ name: Role.Author })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        const roles = (await usersService.safeGetById(user.model.id, [RoleModel])).roles.map(r => r.name);
        expect(roles).toEqual([Role.User]);
      }),
    );
  });

  afterAll(async () => {
    await book.destroy({ force: true });

    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await restricted.model.token?.destroy();
    await restricted.model.destroy({ force: true });

    await app.close();
  });
});
