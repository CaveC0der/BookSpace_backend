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
  genre2CreationDto,
  genreCreationDto,
  genreUpdateDto,
  signupDto,
} from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { Role } from '../../src/roles/role.enum';
import GenreModel from '../../src/genres/models/genre.model';
import { GenresService } from '../../src/genres/genres.service';
import BookModel from '../../src/books/models/book.model';
import { BooksService } from '../../src/books/books.service';
import { AccessUserModel } from '../types';
import { GenreCreationT } from '../../src/genres/types/genre-creation.type';
import { GenreUpdateT } from '../../src/genres/types/genre-update.type';
import BooksQueryDto from '../../src/books/dtos/books-query.dto';

describe('Genres e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
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
    genresService = app.get(GenresService);
    booksService = app.get(BooksService);

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

  describe('(POST) /genres', () => {
    it('without token', () => request(server)
      .post('/genres')
      .send(genreCreationDto)
      .expect(401),
    );

    it('invalid token', () => request(server)
      .post('/genres')
      .send(genreCreationDto)
      .set('authorization', `Bearer ${admin.accessToken.slice(0, -5)}`)
      .expect(401),
    );

    it('not an admin', () => request(server)
      .post('/genres')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(genreCreationDto)
      .expect(403),
    );

    it('invalid data', () => request(server)
      .post('/genres')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({ name: '' } as GenreCreationT)
      .expect(400),
    );

    it('success', () => request(server)
      .post('/genres')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(genreCreationDto)
      .expect(201)
      .expect(({ body }: { body: GenreModel }) => {
        expect(body.name).toBe(genreCreationDto.name);
      }),
    );

    it('genre already exists', () => request(server)
      .post('/genres')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(genreCreationDto)
      .expect(400),
    );
  });

  describe('(GET) /genres', () => {
    it('success', () => request(server)
      .get('/genres')
      .expect(200)
      .expect(({ body }: { body: GenreModel[] }) => {
        const genres = body.map(g => g.name);
        expect(genres).toBeInstanceOf(Array);
        expect(genres).toContain(genreCreationDto.name);
      }),
    );
  });

  describe('(GET) /genres/:id', () => {
    it('not found', () => request(server)
      .get('/genres/does-not-exist')
      .expect(404),
    );

    it('success', () => request(server)
      .get(`/genres/${genreCreationDto.name}`)
      .expect(200)
      .expect(({ body }: { body: GenreModel }) => {
        expect(body).toHaveProperty('description');
        expect(body.name).toBe(genreCreationDto.name);
      }),
    );
  });

  describe('(PUT) /genres/:id', () => {
    it('not an admin', () => request(server)
      .put(`/genres/${genreCreationDto.name}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(genreUpdateDto)
      .expect(403),
    );

    it('not found', () => request(server)
      .put('/genres/does-not-exist')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(genreUpdateDto)
      .expect(404),
    );

    it('invalid data', () => request(server)
      .put(`/genres/${genreCreationDto.name}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({ description: '' } as GenreUpdateT)
      .expect(400),
    );

    it('success', () => request(server)
      .put(`/genres/${genreCreationDto.name}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(genreUpdateDto)
      .expect(200)
      .expect(async () => {
        expect((await genresService.get(genreCreationDto.name)).description).toBe(genreUpdateDto.description);
      }),
    );
  });

  describe('(GET) /genres/:id/books', () => {
    let book: BookModel;

    beforeAll(async () => {
      book = await booksService.create(admin.model.id, bookCreationDto);
      await genresService.create(genre2CreationDto);
    });

    it('genre not found', () => request(server)
      .get('/genres/does-not-exist/books')
      .expect(404),
    );

    it('no books of genre', () => request(server)
      .get(`/genres/${genre2CreationDto.name}/books`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(0);
      }),
    );

    it('success', () => request(server)
      .get(`/genres/${genreCreationDto.name}/books`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const _book = body.find(b => b.id === book.id);
        expect(_book).toBeDefined();
        expect(_book!.author).toBeUndefined();
        expect(_book!.genres).toBeInstanceOf(Array);
      }),
    );

    it('success with eager loading', () => request(server)
      .get(`/genres/${genreCreationDto.name}/books`)
      .query({ eager: true } as BooksQueryDto)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const _book = body.find(b => b.id === book.id);
        expect(_book).toBeDefined();
        expect(_book!.author!.id).toBe(admin.model.id);
        expect(_book!.genres).toBeInstanceOf(Array);
      }),
    );

    afterAll(async () => {
      await book.destroy({ force: true });
      await genresService.delete(genre2CreationDto.name);
    });
  });

  afterAll(async () => {
    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await genresService.delete(genreCreationDto.name);

    await app.close();
  });
});
