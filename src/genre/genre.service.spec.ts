import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { GenreService } from './genre.service';
import GenreModel from './genre.model';
import UserModel from '../user/user.model';
import BooksQueryDto from '../book/dtos/books-query.dto';

describe('GenreService', () => {
  let service: GenreService;

  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_new-password',
  };
  const mockGenre = {
    name: 'Fantasy',
    $get: jest.fn().mockImplementation(() => [mockUser]),
  };
  const returnMockGenre = jest.fn().mockImplementation(() => mockGenre);
  const returnAffectedMockGenres = jest.fn().mockImplementation(() => 1);
  const mockGenreRepo = {
    create: returnMockGenre,
    findByPk: returnMockGenre,
    update: returnAffectedMockGenres,
    destroy: returnAffectedMockGenres,
    findAll: jest.fn().mockImplementation(() => [mockGenre]),
  };
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: getModelToken(GenreModel),
          useValue: mockGenreRepo,
        },
      ],
    }).compile();

    service = module.get(GenreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('normal', async () => {
      await expect(service.create(mockGenre)).resolves.toStrictEqual(mockGenre);
    });

    it('validation error / already exists', async () => {
      mockGenreRepo.create.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.create(mockGenre)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('normal', async () => {
      await expect(service.get(mockGenre.name)).resolves.toStrictEqual(mockGenre);
    });

    it('not found', async () => {
      mockGenreRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.get(mockGenre.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('normal', async () => {
      await expect(service.update(mockGenre.name, '')).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockGenreRepo.update.mockImplementationOnce(() => 0);

      await expect(service.update(mockGenre.name, '')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('normal', async () => {
      await expect(service.delete(mockGenre.name)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockGenreRepo.update.mockImplementationOnce(() => 0);

      await expect(service.delete(mockGenre.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('normal', async () => {
      await expect(service.getAll()).resolves.toBeInstanceOf(Array);
    });
  });

  describe('getGenreBooks', () => {
    it('normal', async () => {
      await expect(service.getGenreBooks(mockGenre.name, {})).resolves.toBeInstanceOf(Array);
    });

    it('role not found', async () => {
      mockGenreRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.getGenreBooks(mockGenre.name, {})).rejects.toThrow(NotFoundException);
    });

    it('eager', async () => {
      const dto = { eager: 'true' } as BooksQueryDto;
      await service.getGenreBooks(mockGenre.name, dto);

      expect(mockGenre.$get).toHaveBeenCalledWith('books', {
        include: [UserModel],
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });
  });
});
