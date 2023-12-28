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
  genreCreationDto,
  reviewCreationDto,
  reviewUpdateDto,
  signupDto,
} from '../data';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import UserModel from '../../src/users/user.model';
import { Role } from '../../src/roles/role.enum';
import { BooksService } from '../../src/books/books.service';
import BookModel from '../../src/books/models/book.model';
import { GenresService } from '../../src/genres/genres.service';
import GenreModel from '../../src/genres/models/genre.model';
import ReviewModel from '../../src/reviews/review.model';
import { ReviewsService } from '../../src/reviews/reviews.service';

describe('Reviews e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
  let reviewsService: ReviewsService;
  let user: { model: UserModel, accessToken: string };
  let admin: { model: UserModel, accessToken: string };
  let genre: GenreModel;
  let book: BookModel;
  let review: ReviewModel;

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
    reviewsService = app.get(ReviewsService);

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

    genre = await genresService.create(genreCreationDto);
    book = await booksService.create(admin.model.id, bookCreationDto);

    reviewCreationDto.bookId = book.id;
  });

  describe('(POST) /reviews', () => {
    it('success', () => request(server)
      .post('/reviews')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(reviewCreationDto)
      .expect(201)
      .expect(({ body }: { body: ReviewModel }) => {
        expect(body.bookId).toBe(book.id);
        expect(body.userId).toBe(user.model.id);
        expect(body.rate).toBe(reviewCreationDto.rate);
        review = body;
      }),
    );
  });

  describe('(GET) /reviews/me-:id', () => {
    it('success', () => request(server)
      .get(`/reviews/me-${book.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: ReviewModel }) => {
        expect(body.bookId).toBe(book.id);
        expect(body.userId).toBe(user.model.id);
      }),
    );
  });

  describe('(PUT) /reviews/me-:id', () => {
    it('success', () => request(server)
      .put(`/reviews/me-${book.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(reviewUpdateDto)
      .expect(200)
      .expect(async () => {
        const updated = await reviewsService.get(review.userId, review.bookId);
        expect(updated.userId).toBe(user.model.id);
        expect(updated.bookId).toBe(book.id);
        expect(updated.rate).toBe(reviewUpdateDto.rate);
        review = updated;
      }),
    );
  });

  describe('(GET) /reviews/:userId-:bookId', () => {
    it('success', () => request(server)
      .get(`/reviews/${user.model.id}-${book.id}`)
      .expect(200)
      .expect(({ body }: { body: ReviewModel }) => {
        expect(body.bookId).toBe(book.id);
        expect(body.userId).toBe(user.model.id);
      }),
    );
  });

  describe('(GET) /reviews/books/:id', () => {
    it('success', () => request(server)
      .get(`/reviews/books/${book.id}`)
      .expect(200)
      .expect(({ body }: { body: ReviewModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(r => ({ bid: r.bookId, uid: r.userId })))
          .toContainEqual({ bid: book.id, uid: user.model.id });
      }),
    );
  });

  describe('(GET) /reviews/users/:id', () => {
    it('success', () => request(server)
      .get(`/reviews/users/${user.model.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: ReviewModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body.map(r => ({ bid: r.bookId, uid: r.userId })))
          .toContainEqual({ bid: book.id, uid: user.model.id });
      }),
    );
  });

  describe('(DELETE) /reviews/me-:id', () => {
    it('success', () => request(server)
      .delete(`/reviews/me-${book.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(reviewsService.get(review.userId, review.bookId)).rejects.toThrow(NotFoundException);
        review = await reviewsService.create(user.model.id, reviewCreationDto);
      }),
    );
  });

  describe('(DELETE) /reviews/:userId-:bookId', () => {
    it('success', () => request(server)
      .delete(`/reviews/${user.model.id}-${book.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(reviewsService.get(user.model.id, book.id)).rejects.toThrow(NotFoundException);
      }),
    );
  });

  afterAll(async () => {
    await book.destroy({ force: true });

    await user.model.token?.destroy();
    await user.model.destroy({ force: true });

    await admin.model.token?.destroy();
    await admin.model.destroy({ force: true });

    await genre.destroy();

    await app.close();
  });
});
