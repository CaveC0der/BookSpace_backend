// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ValidationPipe } from '@nestjs/common';
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
  bookUpdateDto,
  genreCreationDto,
  loginDto,
  signupDto,
} from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import * as fs from 'fs';
import * as path from 'path';
import { BooksService } from '../../src/books/books.service';
import BookModel from '../../src/books/models/book.model';
import { GenresService } from '../../src/genres/genres.service';
import GenreModel from '../../src/genres/models/genre.model';

describe('Books e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
  let author: { model: UserModel, accessToken: string };
  let admin: { model: UserModel, accessToken: string };
  let genre: GenreModel;
  let book: BookModel;
  let file: Buffer;

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

    let { dto } = await authService.signup(signupDto);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(loginDto)).dto;
    author = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };
    dto = (await authService.signup(adminSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Admin);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(adminLoginDto)).dto;
    admin = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    genre = await genresService.create(genreCreationDto);

    file = fs.readFileSync(path.join(__dirname, '../../static/test-img.png'));
  });

  describe('(POST) /books', () => {
    it('success', () => request(server)
      .post('/books')
      .set('authorization', `Bearer ${author.accessToken}`)
      .send(bookCreationDto)
      .expect(201)
      .expect(({ body }: { body: BookModel }) => {
        expect(body.name).toBe(bookCreationDto.name);
        expect(body.authorId).toBe(author.model.id);
        book = body;
      }),
    );
  });

  describe('(GET) /books', () => {
    it('success', () => request(server)
      .get('/books')
      .query({ query: 'B', limit: 10 })
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(b => b.name)).toContain(bookCreationDto.name);
      }),
    );
  });

  describe('(GET) /books/my', () => {
    it('success', () => request(server)
      .get('/books/my')
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(b => b.name)).toContain(bookCreationDto.name);
      }),
    );
  });

  describe('(GET) /books/:id', () => {
    it('success', () => request(server)
      .get(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: BookModel }) => {
        expect(body.name).toBe(bookCreationDto.name);
        expect(body.viewsCount).toBe(book.viewsCount + 1);
        book = body;
      }),
    );
  });

  describe('(PUT) /books/:id', () => {
    it('success', () => request(server)
      .put(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .send(bookUpdateDto)
      .expect(200)
      .expect(async () => {
        book = await booksService.get(book.id);
        expect(book.synopsis).toBe(bookUpdateDto.synopsis);
      }),
    );
  });

  describe('(DELETE) /books/:id', () => {
    it('success', () => request(server)
      .delete(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(booksService.get(book.id)).rejects.toThrow(NotFoundException);
      }),
    );
  });

  describe('(POST) /books/:id', () => {
    it('success', () => request(server)
      .post(`/books/${book.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        expect((await booksService.get(book.id)).name).toBe(book.name);
      }),
    );
  });

  describe('(POST) /books/:id/cover', () => {
    it('success', () => request(server)
      .post(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .attach('img', file, 'test-img.png')
      .expect(201),
    );
  });

  describe('(DELETE) /books/:id/cover', () => {
    it('success', () => request(server)
      .delete(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200),
    );
  });

  describe('(POST) /books/:id/genres', () => {
    it('success', () => request(server)
      .post(`/books/${book.id}/genres`)
      .query({ names: 'Sci-Fi' })
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(201)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).toEqual(bookCreationDto.genres);
      }),
    );
  });

  describe('(DELETE) /books/:id/genres', () => {
    it('success', () => request(server)
      .delete(`/books/${book.id}/genres`)
      .query({ names: 'Sci-Fi' })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).toHaveLength(0);
      }),
    );
  });

  afterAll(async () => {
    await book.destroy({ force: true });

    await author.model.token?.destroy();
    await author.model.destroy({ force: true });

    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await genre.destroy();

    await app.close();
  });
});
