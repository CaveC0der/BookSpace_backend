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
  author2LoginDto,
  author2SignupDto,
  authorLoginDto,
  authorSignupDto,
  book2CreationDto,
  book3CreationDto,
  bookCreationDto,
  bookUpdateDto,
  genre2CreationDto,
  genreCreationDto,
  img,
  restrictedLoginDto,
  restrictedSignupDto,
  signupDto,
} from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { Role } from '../../src/roles/role.enum';
import { BooksService } from '../../src/books/books.service';
import BookModel from '../../src/books/models/book.model';
import { GenresService } from '../../src/genres/genres.service';
import GenreModel from '../../src/genres/models/genre.model';
import BookCreationDto from '../../src/books/dtos/book-creation.dto';
import FindBooksQueryDto from '../../src/books/dtos/find-books-query.dto';
import { AccessUserModel } from '../types';
import BookUpdateDto from '../../src/books/dtos/book-update.dto';

describe('Books e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
  let user: AccessUserModel;
  let author: AccessUserModel;
  let author2: AccessUserModel;
  let admin: AccessUserModel;
  let restricted: AccessUserModel;
  let genre: GenreModel;
  let genre2: GenreModel;
  let book: BookModel;
  let book2: BookModel;
  let book3: BookModel;

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
    user = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(authorSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(authorLoginDto)).dto;
    author = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(author2SignupDto)).dto;
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(author2LoginDto)).dto;
    author2 = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(restrictedSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Author);
    await usersService.addRole(dto.id, Role.Restricted);
    dto = (await authService.login(restrictedLoginDto)).dto;
    restricted = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    dto = (await authService.signup(adminSignupDto)).dto;
    await usersService.addRole(dto.id, Role.Admin);
    await usersService.addRole(dto.id, Role.Author);
    dto = (await authService.login(adminLoginDto)).dto;
    admin = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    genre = await genresService.create(genreCreationDto);
    genre2 = await genresService.create(genre2CreationDto);

    book2 = await booksService.create(author2.model.id, book2CreationDto);
    book3 = await booksService.create(restricted.model.id, book3CreationDto);
  });

  describe('(POST) /books', () => {
    it('without token', () => request(server)
      .post('/books')
      .send(bookCreationDto)
      .expect(401),
    );

    it('invalid token', () => request(server)
      .post('/books')
      .send(bookCreationDto)
      .set('authorization', `Bearer ${author.accessToken.slice(0, -5)}`)
      .expect(401),
    );

    it('not an author', () => request(server)
      .post('/books')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(bookCreationDto)
      .expect(403),
    );

    it('restricted', () => request(server)
      .post('/books')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .send(bookCreationDto)
      .expect(403),
    );

    it('invalid data', () => request(server)
      .post('/books')
      .set('authorization', `Bearer ${author.accessToken}`)
      .send({ name: '' } as BookCreationDto)
      .expect(400),
    );

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

    it('book already exists', () => request(server)
      .post('/books')
      .set('authorization', `Bearer ${author.accessToken}`)
      .send(bookCreationDto)
      .expect(400),
    );
  });

  describe('(GET) /books', () => {
    it('invalid query', () => request(server)
      .get('/books')
      .query({ orderBy: 'invalidOrder', mode: 'invalidMode' })
      .expect(400),
    );

    it('none of books match query', () => request(server)
      .get('/books')
      .query({ name: 'DoesNotExist' } as FindBooksQueryDto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      }),
    );

    it('success', () => request(server)
      .get('/books')
      .query({ name: 'B', limit: 10 } as FindBooksQueryDto)
      .expect(200)
      .expect(({ body }: { body: BookModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const names = body.map(b => b.name);
        expect(names).toContain(bookCreationDto.name);
        expect(names).toContain(book2CreationDto.name);
        expect(names).toContain(book3CreationDto.name);
      }),
    );
  });

  describe('(GET) /books/:id', () => {
    it('not found', () => request(server)
      .get('/books/404')
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .get('/books/invalid')
      .expect(400),
    );

    it('success', () => request(server)
      .get(`/books/${book.id}`)
      .expect(200)
      .expect(({ body }: { body: BookModel }) => {
        expect(body.name).toBe(bookCreationDto.name);
        expect(body.viewsCount).toBe(book.viewsCount);
        book = body;
      }),
    );
  });

  describe('(PUT) /books/:id', () => {
    it('not found', () => request(server)
      .put('/books/404')
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .put('/books/invalid')
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .put(`/books/${book.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .put(`/books/${book.id}`)
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('restricted', () => request(server)
      .put(`/books/${book3.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(403),
    );

    it('success - author', () => request(server)
      .put(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .send(bookUpdateDto)
      .expect(200)
      .expect(async () => {
        book = await booksService.get(book.id);
        expect(book.synopsis).toBe(bookUpdateDto.synopsis);
      }),
    );

    it('success - admin', () => request(server)
      .put(`/books/${book.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({ genres: [...book.genres.map(g => g.name), genre2CreationDto.name] } as BookUpdateDto)
      .expect(200)
      .expect(async () => {
        book = await booksService.get(book.id);
        expect(book.genres.map(g => g.name)).toEqual([genreCreationDto.name, genre2CreationDto.name]);
      }),
    );
  });

  describe('(DELETE) /books/:id', () => {
    it('not found', () => request(server)
      .delete('/books/404')
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .delete('/books/invalid')
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .delete(`/books/${book.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .delete(`/books/${book.id}`)
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('success - restricted', () => request(server)
      .delete(`/books/${book3.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(booksService.get(book3.id)).rejects.toThrow(NotFoundException);
      }),
    );

    it('success - author', () => request(server)
      .delete(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(booksService.get(book.id)).rejects.toThrow(NotFoundException);
      }),
    );

    it('success - admin', () => request(server)
      .delete(`/books/${book2.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(booksService.get(book.id)).rejects.toThrow(NotFoundException);
      }),
    );
  });

  describe('(POST) /books/:id', () => {
    it('not found', () => request(server)
      .post('/books/404')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .post('/books/invalid')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(400),
    );

    it('restricted', () => request(server)
      .post(`/books/${book3.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(403),
    );

    it('success - author', () => request(server)
      .post(`/books/${book.id}`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(201)
      .expect(async () => {
        expect((await booksService.get(book.id)).name).toBe(book.name);
      }),
    );

    it('success - admin', () => request(server)
      .post(`/books/${book2.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        expect((await booksService.get(book2.id)).name).toBe(book2.name);
      }),
    );
  });

  describe('(POST) /books/:id/cover', () => {
    it('not found', () => request(server)
      .post('/books/404/cover')
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .post('/books/invalid/cover')
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .post(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .post(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('restricted', () => request(server)
      .post(`/books/${book3.id}/cover`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(403),
    );

    it('filename without extension', () => request(server)
      .post(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .attach(img.fieldname, img.buffer, 'test-img')
      .expect(400),
    );

    it('success', () => request(server)
      .post(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .attach(img.fieldname, img.buffer, img.originalname)
      .expect(201),
    );
  });

  describe('(DELETE) /books/:id/cover', () => {
    beforeAll(async () => {
      await booksService.restore(admin.model.id, book3.id, true);
      await booksService.setCover(author2.model.id, book2.id, img);
      await booksService.setCover(restricted.model.id, book3.id, img);
    });

    it('not found', () => request(server)
      .delete('/books/404/cover')
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .delete('/books/invalid/cover')
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .delete(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .delete(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('success - restricted', () => request(server)
      .delete(`/books/${book3.id}/cover`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200),
    );

    it('success - author', () => request(server)
      .delete(`/books/${book.id}/cover`)
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200),
    );

    it('success - admin', () => request(server)
      .delete(`/books/${book2.id}/cover`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200),
    );
  });

  describe('(DELETE) /books/:id/genres', () => {
    it('not found', () => request(server)
      .delete('/books/404/genres')
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .delete('/books/invalid/genres')
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .delete(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .delete(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('success - restricted', () => request(server)
      .delete(`/books/${book3.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(async () => {
        const genres = (await booksService.get(book3.id)).genres.map(g => g.name);
        expect(genres).not.toContain(genreCreationDto.name);
      }),
    );

    it('success - author', () => request(server)
      .delete(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(200)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).not.toContain(genreCreationDto.name);
      }),
    );

    it('success - admin', () => request(server)
      .delete(`/books/${book.id}/genres`)
      .query({ names: genre2CreationDto.name })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).toEqual([]);
      }),
    );
  });

  describe('(POST) /books/:id/genres', () => {
    it('not found', () => request(server)
      .post('/books/404/genres')
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(404),
    );

    it('invalid path param', () => request(server)
      .post('/books/invalid/genres')
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(400),
    );

    it('not an author', () => request(server)
      .post(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('author, but not owner', () => request(server)
      .post(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author2.accessToken}`)
      .expect(403),
    );

    it('success - restricted', () => request(server)
      .post(`/books/${book3.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(201)
      .expect(async () => {
        const genres = (await booksService.get(book3.id)).genres.map(g => g.name);
        expect(genres).toContain(genreCreationDto.name);
      }),
    );

    it('success - author', () => request(server)
      .post(`/books/${book.id}/genres`)
      .query({ names: genreCreationDto.name })
      .set('authorization', `Bearer ${author.accessToken}`)
      .expect(201)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).toContain(genreCreationDto.name);
      }),
    );

    it('success - admin', () => request(server)
      .post(`/books/${book.id}/genres`)
      .query({ names: genre2CreationDto.name })
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(201)
      .expect(async () => {
        const genres = (await booksService.get(book.id)).genres.map(g => g.name);
        expect(genres).toContain(genre2CreationDto.name);
      }),
    );
  });

  afterAll(async () => {
    await book.destroy({ force: true });
    await book2.destroy({ force: true });
    await book3.destroy({ force: true });

    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await author.model.token?.destroy();
    await author.model.destroy({ force: true });

    await author2.model.token?.destroy();
    await author2.model.destroy({ force: true });

    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await restricted.model.token?.destroy();
    await restricted.model.destroy({ force: true });

    await genre.destroy();
    await genre2.destroy();

    await app.close();
  });
});
