import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import * as bcryptjs from 'bcryptjs';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { col, fn, Op, ValidationError, ValidationErrorItem } from 'sequelize';
import { BooksService } from './books.service';
import BookModel from './models/book.model';
import { ViewModel } from './models/view.model';
import FindBooksQueryDto from './dtos/find-books-query.dto';
import { BookGenreModel } from '../genres/models/book-genre.model';
import { FilesService } from '../files/files.service';
import { GenresService } from '../genres/genres.service';
import GenreModel from '../genres/models/genre.model';
import UserModel from '../users/user.model';

describe('BooksService', () => {
  let service: BooksService;

  const mockBook = {
    id: 1,
    name: 'MockBook',
    cover: 'cover',
    synopsis: null,
    rating: 5,
    authorId: 1,
    viewsCount: 100,
    reviewsCount: 100,
    commentsCount: 100,
    update: jest.fn(),
    destroy: jest.fn(),
    restore: jest.fn(),
    $add: jest.fn(),
    $remove: jest.fn(),
  };
  const returnMockUser = jest.fn().mockImplementation(() => mockBook);
  const mockBookRepo = {
    create: returnMockUser,
    findByPk: returnMockUser,
    findOne: returnMockUser,
    findAll: jest.fn().mockImplementation(() => [mockBook]),
    destroy: jest.fn().mockImplementation(() => 1),
    restore: jest.fn(),
  };
  const mockView = {
    changed: jest.fn(),
    save: jest.fn(),
  };
  const returnMockView = jest.fn().mockImplementation(() => mockView);
  const mockViewRepo = {
    create: returnMockView,
    findOne: returnMockView,
  };
  const mockBookGenreRepo = {
    findAll: jest.fn().mockImplementation(() => [{ bookId: 1 }]),
  };
  const mockFileService = {
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockGenre = {
    name: 'Fantasy',
    description: 'Wonderful...',
  };
  const mockGenreService = { getMany: jest.fn().mockImplementation(() => [mockGenre]) };
  const mockFile = { originalname: 'originalname.png' } as Express.Multer.File;
  const mockValidationError = new ValidationError('mock validation failed', [{
    message: 'mock',
    type: 'mock',
    path: 'mock',
    value: 'mock@mail.com',
    origin: 'DB',
    validatorKey: 'mock',
  } as unknown as ValidationErrorItem]);

  beforeAll(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
    jest.spyOn(bcryptjs, 'hash').mockImplementation((str: string, saltLength: number) => {
      const hash = `hashed_${saltLength}_${str}`;
      console.log(hash);
      return hash;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(BookModel),
          useValue: mockBookRepo,
        },
        {
          provide: getModelToken(ViewModel),
          useValue: mockViewRepo,
        },
        {
          provide: getModelToken(BookGenreModel),
          useValue: mockBookGenreRepo,
        },
        {
          provide: FilesService,
          useValue: mockFileService,
        },
        {
          provide: GenresService,
          useValue: mockGenreService,
        },
      ],
    }).compile();

    service = module.get(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('normal', async () => {
      await expect(service.create(mockBook.authorId, { name: mockBook.name })).resolves.toStrictEqual(mockBook);
    });

    it('validation error / already exists', async () => {
      mockBookRepo.create.mockImplementationOnce(() => { throw mockValidationError;});

      await expect(service.create(mockBook.authorId, { name: mockBook.name })).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('normal', async () => {
      await expect(service.get(mockBook.id)).resolves.toStrictEqual(mockBook);
      await expect(service.get(mockBook.id, mockBook.authorId)).resolves.toStrictEqual(mockBook);
    });

    it('new view', async () => {
      mockViewRepo.findOne.mockImplementationOnce(() => null);

      await expect(service.get(mockBook.id, mockBook.authorId)).resolves.toStrictEqual(mockBook);
    });

    it('book not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.get(mockBook.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('normal', async () => {
      await expect(service.update(mockBook.authorId, mockBook.id, { name: 'New mock name' })).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.update(0, mockBook.id, { name: 'New mock name' })).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.update(0, mockBook.id, { name: 'New mock name' }, true)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.update(mockBook.authorId, mockBook.id, { name: 'New mock name' })).rejects.toThrow(NotFoundException);
    });

    it('update failed', async () => {
      mockBook.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.update(mockBook.authorId, mockBook.id, { name: 'New mock name' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('normal + hard', async () => {
      await expect(service.delete(mockBook.authorId, mockBook.id, true)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.delete(0, mockBook.id)).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.delete(mockBook.authorId, mockBook.id, false, true)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.delete(mockBook.authorId, mockBook.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('normal + hard', async () => {
      await expect(service.restore(mockBook.authorId, mockBook.id)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.restore(0, mockBook.id)).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.restore(0, mockBook.id, true)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.restore(mockBook.authorId, mockBook.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setCover', () => {
    it('normal', async () => {
      await expect(service.setCover(mockBook.authorId, mockBook.id, mockFile)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.setCover(0, mockBook.id, mockFile)).rejects.toThrow(ForbiddenException);
    });

    it('book not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.setCover(mockBook.authorId, mockBook.id, mockFile)).rejects.toThrow(NotFoundException);
    });

    it('FileService.delete failed', async () => {
      mockFileService.delete.mockImplementationOnce(() => { throw new InternalServerErrorException(); });

      await expect(service.setCover(mockBook.authorId, mockBook.id, mockFile)).rejects.toThrow(InternalServerErrorException);
    });

    it('FileService.save failed', async () => {
      mockFileService.save.mockImplementationOnce(() => { throw new BadRequestException(); });

      await expect(service.setCover(mockBook.authorId, mockBook.id, mockFile)).rejects.toThrow(BadRequestException);
    });

    it('update failed', async () => {
      mockBook.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.setCover(mockBook.authorId, mockBook.id, mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCover', () => {
    it('normal', async () => {
      await expect(service.deleteCover(mockBook.authorId, mockBook.id)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.deleteCover(0, mockBook.id)).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.deleteCover(0, mockBook.id, true)).resolves.toBeUndefined();
    });

    it('book not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.deleteCover(mockBook.authorId, mockBook.id)).rejects.toThrow(NotFoundException);
    });

    it('FileService.delete failed', async () => {
      mockFileService.delete.mockImplementationOnce(() => { throw new InternalServerErrorException(); });

      await expect(service.deleteCover(mockBook.authorId, mockBook.id)).rejects.toThrow(InternalServerErrorException);
    });

    it('update failed', async () => {
      mockBook.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.deleteCover(mockBook.authorId, mockBook.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addGenres / excludeGenres', () => {
    it('normal', async () => {
      await expect(service.addGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).resolves.toBeUndefined();
      await expect(service.excludeGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.addGenres(0, mockBook.id, ['Fantasy'])).rejects.toThrow(ForbiddenException);
      await expect(service.excludeGenres(0, mockBook.id, ['Fantasy'])).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.addGenres(0, mockBook.id, ['Fantasy'], true)).resolves.toBeUndefined();
      await expect(service.excludeGenres(0, mockBook.id, ['Fantasy'], true)).resolves.toBeUndefined();
    });

    it('user not found', async () => {
      mockBookRepo.findByPk.mockImplementationOnce(() => null)
        .mockImplementationOnce(() => null);

      await expect(service.addGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).rejects.toThrow(NotFoundException);
      await expect(service.excludeGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).rejects.toThrow(NotFoundException);
    });

    it('genre not found', async () => {
      mockGenreService.getMany.mockImplementationOnce(() => { throw new NotFoundException(); })
        .mockImplementationOnce(() => { throw new NotFoundException(); });

      await expect(service.addGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).rejects.toThrow(NotFoundException);
      await expect(service.excludeGenres(mockBook.authorId, mockBook.id, ['Fantasy'])).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('normal', async () => {
      await expect(service.find({}, {})).resolves.toBeInstanceOf(Array);
    });

    it('query - default mode', async () => {
      const dto = { query: 'Query' };
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: { name: { [Op['startsWith']]: dto.query } },
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });

    it('query - specified mode', async () => {
      const dto = { mode: 'substring', query: 'Query' } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: { name: { [Op['substring']]: dto.query } },
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });

    it('genres', async () => {
      const dto = { genres: ['Fantasy'] } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: { id: { [Op.in]: [1] } },
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });

    it('query + genres', async () => {
      const dto = { mode: 'substring', query: 'Query', genres: ['Fantasy'] } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: { name: { [Op['substring']]: dto.query }, id: { [Op.in]: [1] } },
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });

    it('orderBy', async () => {
      const dto = { orderBy: 'name' } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: {},
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: [dto.orderBy],
      });
    });

    it('orderBy + orderDirection', async () => {
      const dto = { orderBy: 'name', orderDirection: 'ASC' } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: {},
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: [[dto.orderBy, dto.orderDirection]],
      });
    });

    it('orderBy: popularity', async () => {
      const dto = { orderBy: 'popularity' } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: {},
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: [[
          fn('related_popularity',
            col('BookModel.viewsCount'),
            col('BookModel.reviewsCount'),
            col('BookModel.commentsCount')),
          'ASC']],
      });
    });

    it('eager', async () => {
      const dto = { eager: 'true' } as FindBooksQueryDto;
      await service.find({}, dto);

      expect(mockBookRepo.findAll).toHaveBeenCalledWith({
        where: {},
        include: [UserModel, GenreModel],
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });
  });
});
