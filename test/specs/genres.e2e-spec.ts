// noinspection DuplicatedCode

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'http';
import { adminLoginDto, adminSignupDto, bookCreationDto, genreCreationDto, genreUpdateDto } from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import GenreModel from '../../src/genres/models/genre.model';
import { GenresService } from '../../src/genres/genres.service';
import BookModel from '../../src/books/models/book.model';
import { BooksService } from '../../src/books/books.service';

describe('Genres e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
  let admin: { model: UserModel, accessToken: string };

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
  });

  describe('(POST) /genres', () => {
    it('success', () => request(server)
      .post('/genres')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send(genreCreationDto)
      .expect(201)
      .expect(({ body }: { body: GenreModel }) => {
        expect(body.name).toBe(genreCreationDto.name);
      }),
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
    });

    it('success', () => request(server)
      .get(`/genres/${genreCreationDto.name}/books`)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(b => b.id)).toContain(book.id);
      }),
    );

    afterAll(async () => {
      await book.destroy({ force: true });
    });
  });

  afterAll(async () => {
    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await genresService.delete(genreCreationDto.name);

    await app.close();
  });
});
