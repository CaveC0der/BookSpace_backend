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
  comment2CreationDto,
  commentCreationDto,
  commentUpdateDto,
  genreCreationDto,
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
import CommentModel from '../../src/comments/comment.model';
import { CommentsService } from '../../src/comments/comments.service';
import CommentCreationDto from '../../src/comments/dtos/comment-creation.dto';
import { AccessUserModel } from '../types';

describe('Comments e2e', () => {
  let app: NestExpressApplication;
  let server: Server;
  let config: ConfigService;
  let authService: AuthService;
  let usersService: UsersService;
  let genresService: GenresService;
  let booksService: BooksService;
  let commentsService: CommentsService;
  let user: AccessUserModel;
  let admin: AccessUserModel;
  let restricted: AccessUserModel;
  let genre: GenreModel;
  let book: BookModel;
  let comment: CommentModel;
  let comment2: CommentModel;
  let comment3: CommentModel;
  let nonExistentId: number;

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
    commentsService = app.get(CommentsService);

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
    await usersService.addRole(dto.id, Role.Restricted);
    dto = (await authService.login(restrictedLoginDto)).dto;
    restricted = { model: await usersService.safeGetById(dto.id), accessToken: dto.accessToken };

    genre = await genresService.create(genreCreationDto);
    book = await booksService.create(admin.model.id, bookCreationDto);

    commentCreationDto.bookId = book.id;
    comment2CreationDto.bookId = book.id;

    comment2 = await commentsService.create(restricted.model.id, comment2CreationDto);
    comment3 = await commentsService.create(user.model.id, comment2CreationDto);

    nonExistentId = comment3.id + 404;
  });

  describe('(POST) /comments', () => {
    it('without token', () => request(server)
      .post('/comments')
      .send(commentCreationDto)
      .expect(401),
    );

    it('invalid token', () => request(server)
      .post('/comments')
      .send(commentCreationDto)
      .set('authorization', `Bearer ${user.accessToken.slice(0, -5)}`)
      .expect(401),
    );

    it('restricted', () => request(server)
      .post('/comments')
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .send(commentCreationDto)
      .expect(403),
    );

    it('invalid data', () => request(server)
      .post('/comments')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send({ bookId: 0 } as CommentCreationDto)
      .expect(400),
    );

    it('success', () => request(server)
      .post('/comments')
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(commentCreationDto)
      .expect(201)
      .expect(({ body }: { body: CommentModel }) => {
        expect(body.bookId).toBe(book.id);
        expect(body.text).toBe(commentCreationDto.text);
        comment = body;
      }),
    );
  });

  describe('(GET) /comments/:id', () => {
    it('not found', () => request(server)
      .get(`/comments/${nonExistentId}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(404),
    );

    it('success - restricted', () => request(server)
      .get(`/comments/${comment.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: CommentModel }) => {
        expect(body.id).toBe(comment.id);
      }),
    );

    it('success - user', () => request(server)
      .get(`/comments/${comment.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: CommentModel }) => {
        expect(body.id).toBe(comment.id);
      }),
    );
  });

  describe('(PUT) /comments/:id', () => {
    it('user, but not owner', () => request(server)
      .put(`/comments/${comment2.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(commentUpdateDto)
      .expect(403),
    );

    it('not found', () => request(server)
      .put(`/comments/${nonExistentId}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(commentUpdateDto)
      .expect(404),
    );

    it('restricted', () => request(server)
      .put(`/comments/${comment2.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(403),
    );

    it('invalid data', () => request(server)
      .put(`/comments/${comment.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send({})
      .expect(400),
    );

    it('success', () => request(server)
      .put(`/comments/${comment.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .send(commentUpdateDto)
      .expect(200)
      .expect(async () => {
        const updated = await commentsService.get(comment.id);
        expect(updated.id).toBe(comment.id);
        expect(updated.text).toBe(commentUpdateDto.text);
        comment = updated;
      }),
    );
  });

  describe('(GET) /comments/books/:id', () => {
    it('book does not exist or does not have comments', () => request(server)
      .get(`/comments/books/${nonExistentId}`)
      .expect(200)
      .expect(({ body }: { body: CommentModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(0);
      }),
    );

    it('success', () => request(server)
      .get(`/comments/books/${book.id}`)
      .expect(200)
      .expect(({ body }: { body: CommentModel[] }) => {
        expect(body).toBeInstanceOf(Array);
        const ids = body.map(c => c.id);
        expect(ids).toContain(comment.id);
        expect(ids).toContain(comment2.id);
      }),
    );
  });

  describe('(DELETE) /comments/:id', () => {
    it('not found', () => request(server)
      .delete(`/comments/${nonExistentId}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(404),
    );

    it('user, but not owner', () => request(server)
      .delete(`/comments/${comment2.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(403),
    );

    it('success - restricted', () => request(server)
      .delete(`/comments/${comment2.id}`)
      .set('authorization', `Bearer ${restricted.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(commentsService.get(comment2.id)).rejects.toThrow(NotFoundException);
      }),
    );

    it('success - user', () => request(server)
      .delete(`/comments/${comment3.id}`)
      .set('authorization', `Bearer ${user.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(commentsService.get(comment3.id)).rejects.toThrow(NotFoundException);
      }),
    );

    it('success - admin', () => request(server)
      .delete(`/comments/${comment.id}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(async () => {
        await expect(commentsService.get(comment.id)).rejects.toThrow(NotFoundException);
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

    await genre.destroy();

    await app.close();
  });
});
