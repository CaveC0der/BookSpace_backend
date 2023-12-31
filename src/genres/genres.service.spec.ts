import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Op, ValidationError, ValidationErrorItem } from 'sequelize';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service';
import GenreModel from './models/genre.model';
import BooksQueryDto from '../books/dtos/books-query.dto';
import UserModel from '../users/user.model';
import { WhereAttributeHash } from 'sequelize/types/model';

describe('GenreService', () => {
  let service: GenresService;

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
  const mockGenres = [{ name: mockGenre.name }, { name: 'Romance' }, { name: 'Drama' }];
  const returnMockGenre = jest.fn().mockImplementation(() => mockGenre);
  const returnAffectedMockGenres = jest.fn().mockImplementation(() => 1);
  const mockGenreRepo = {
    create: returnMockGenre,
    findByPk: returnMockGenre,
    update: returnAffectedMockGenres,
    destroy: returnAffectedMockGenres,
    findAll: jest.fn().mockImplementation(({ where }: { where?: WhereAttributeHash<GenreModel> }) => {
      if (where) {
        const names = Object.getOwnPropertyDescriptor(where.name, Op.in)!.value;
        return mockGenres.filter(g => names.includes(g.name));
      }
      return mockGenres;
    }),
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
        GenresService,
        {
          provide: getModelToken(GenreModel),
          useValue: mockGenreRepo,
        },
      ],
    }).compile();

    service = module.get(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('success', async () => {
      await expect(service.create(mockGenre)).resolves.toStrictEqual(mockGenre);
    });

    it('create failed (validation)', async () => {
      mockGenreRepo.create.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.create(mockGenre)).rejects.toThrow(BadRequestException);
    });

    it('create failed', async () => {
      mockGenreRepo.create.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.create(mockGenre)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('success', async () => {
      await expect(service.get(mockGenre.name)).resolves.toStrictEqual(mockGenre);
    });

    it('not found', async () => {
      mockGenreRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.get(mockGenre.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMany', () => {
    it('success', async () => {
      await expect(service.getMany(['Fantasy', 'Romance'])).resolves.toEqual([{ name: 'Fantasy' }, { name: 'Romance' }]);
    });

    it('success - all', async () => {
      await expect(service.getMany()).resolves.toEqual(mockGenres);
    });

    it('existent + non-existent genre', async () => {
      await expect(service.getMany(['Fantasy', 'Thriller'])).resolves.toEqual([{ name: 'Fantasy' }]);
    });

    it('non-existent genre', async () => {
      await expect(service.getMany(['Thriller'])).resolves.toEqual([]);
    });
  });

  describe('update', () => {
    it('success', async () => {
      await expect(service.update(mockGenre.name, '')).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockGenreRepo.update.mockImplementationOnce(() => 0);

      await expect(service.update(mockGenre.name, '')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('success', async () => {
      await expect(service.delete(mockGenre.name)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockGenreRepo.update.mockImplementationOnce(() => 0);

      await expect(service.delete(mockGenre.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGenreBooks', () => {
    it('success', async () => {
      await expect(service.getGenreBooks(mockGenre.name, {})).resolves.toBeInstanceOf(Array);
    });

    it('role not found', async () => {
      mockGenreRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.getGenreBooks(mockGenre.name, {})).rejects.toThrow(NotFoundException);
    });

    it('eager', async () => {
      const dto = { eager: true } as BooksQueryDto;
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
