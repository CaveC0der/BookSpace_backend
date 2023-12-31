import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import UserModel from './user.model';
import { ConfigService } from '../config/config.service';
import * as bcryptjs from 'bcryptjs';
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { col, fn, ValidationError, ValidationErrorItem } from 'sequelize';
import { FilesService } from '../files/files.service';
import { Role } from '../roles/role.enum';
import GenreModel from '../genres/models/genre.model';
import BooksQueryDto from '../books/dtos/books-query.dto';

describe('UsersService', () => {
  let service: UsersService;

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
  };
  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_new-password',
    update: jest.fn(),
    restore: jest.fn(),
    avatar: 'avatar.png',
    $add: jest.fn(),
    $remove: jest.fn(),
    $get: jest.fn().mockImplementation(() => [mockBook]),
  };
  const returnMockUser = jest.fn().mockImplementation(() => mockUser);
  const mockUserRepo = {
    create: returnMockUser,
    findByPk: returnMockUser,
    findOne: returnMockUser,
    findCreateFind: jest.fn().mockImplementation(() => [mockUser, true]),
    destroy: jest.fn().mockImplementation(() => 1),
    restore: jest.fn(),
  };
  const mockConfig = {
    SALT_LENGTH: 8,
  };
  const mockFileService = {
    save: jest.fn(),
    delete: jest.fn(),
  };
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
    jest.spyOn(bcryptjs, 'hash').mockImplementation((str: string, saltLength: number) => `hashed_${saltLength}_${str}`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: FilesService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('success', async () => {
      await expect(service.create({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      })).resolves.toStrictEqual(mockUser);
    });

    it('create failed (validation / already exists)', async () => {
      mockUserRepo.create.mockImplementationOnce(() => { throw mockValidationError;});

      await expect(service.create({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      })).rejects.toThrow(BadRequestException);
    });

    it('create failed', async () => {
      mockUserRepo.create.mockImplementationOnce(() => { throw new Error();});

      await expect(service.create({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('success', async () => {
      await expect(service.safeGetById(mockUser.id)).resolves.toStrictEqual(mockUser);
      await expect(service.safeGetByEmail(mockUser.email)).resolves.toStrictEqual(mockUser);
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);
      mockUserRepo.findOne.mockImplementationOnce(() => null);

      await expect(service.safeGetById(mockUser.id)).rejects.toThrow(NotFoundException);
      await expect(service.safeGetByEmail(mockUser.email)).rejects.toThrow(NotFoundException);
    });

    it('or create - created', async () => {
      await expect(service.getCreateGet(mockUser)).resolves.toStrictEqual([mockUser, true]);
    });

    it('or create - found', async () => {
      mockUserRepo.findCreateFind.mockImplementationOnce(() => [mockUser, false]);

      await expect(service.getCreateGet(mockUser)).resolves.toStrictEqual([mockUser, false]);
    });
  });

  describe('update', () => {
    it('success', async () => {
      await expect(service.update(mockUser.id, { password: 'new-password' })).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.update(mockUser.id, { password: 'new-password' })).rejects.toThrow(NotFoundException);
    });

    it('update failed (validation)', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.update(mockUser.id, { password: 'new-password' })).rejects.toThrow(BadRequestException);
    });

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.update(mockUser.id, { password: 'new-password' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('success', async () => {
      await expect(service.delete(mockUser.id)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.destroy.mockImplementationOnce(() => 0);

      await expect(service.delete(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('success', async () => {
      await expect(service.restore(mockUser.id)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.restore(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setAvatar', () => {
    it('success', async () => {
      await expect(service.setAvatar(mockUser.id, mockFile)).resolves.toBeUndefined();
    });

    it('user not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(NotFoundException);
    });

    it('FileService.delete failed', async () => {
      mockFileService.delete.mockImplementationOnce(() => { throw new InternalServerErrorException(); });

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(InternalServerErrorException);
    });

    it('FileService.save failed', async () => {
      mockFileService.save.mockImplementationOnce(() => { throw new BadRequestException(); });

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(BadRequestException);
    });

    it('update failed (validation)', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(BadRequestException);
    });

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAvatar', () => {
    it('success', async () => {
      await expect(service.deleteAvatar(mockUser.id)).resolves.toBeUndefined();
    });

    it('user not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.deleteAvatar(mockUser.id)).rejects.toThrow(NotFoundException);
    });

    it('FileService.delete failed', async () => {
      mockFileService.delete.mockImplementationOnce(() => { throw new InternalServerErrorException(); });

      await expect(service.deleteAvatar(mockUser.id)).rejects.toThrow(InternalServerErrorException);
    });

    it('update failed (validation)', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.deleteAvatar(mockUser.id)).rejects.toThrow(BadRequestException);
    });

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.deleteAvatar(mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBooks', () => {
    it('authored - author', async () => {
      await expect(service.getBooks(mockUser.id, 'authored', {})).resolves.toContainEqual(mockBook);
    });

    it('authored - reader / author without books', async () => {
      mockUser.$get.mockImplementationOnce(() => []);

      await expect(service.getBooks(mockUser.id, 'authored', {})).resolves.toEqual([]);
    });

    it('anyone - viewed', async () => {
      await expect(service.getBooks(mockUser.id, 'viewed', {})).resolves.toContainEqual(mockBook);
    });

    it('orderBy', async () => {
      const dto = { orderBy: 'name' } as BooksQueryDto;
      await service.getBooks(mockUser.id, 'viewed', dto);

      expect(mockUser.$get).toHaveBeenCalledWith('viewed', {
        include: undefined,
        limit: undefined,
        offset: undefined,
        order: [dto.orderBy],
      });
    });

    it('orderBy + orderDirection', async () => {
      const dto = { orderBy: 'name', orderDirection: 'DESC' } as BooksQueryDto;
      await service.getBooks(mockUser.id, 'viewed', dto);

      expect(mockUser.$get).toHaveBeenCalledWith('viewed', {
        include: undefined,
        limit: undefined,
        offset: undefined,
        order: [[dto.orderBy, dto.orderDirection]],
      });
    });

    it('orderBy: popularity', async () => {
      const dto = { orderBy: 'popularity' } as BooksQueryDto;
      await service.getBooks(mockUser.id, 'viewed', dto);

      expect(mockUser.$get).toHaveBeenCalledWith('viewed', {
        include: undefined,
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
      const dto = { eager: true } as BooksQueryDto;
      await service.getBooks(mockUser.id, 'viewed', dto);

      expect(mockUser.$get).toHaveBeenCalledWith('viewed', {
        include: GenreModel,
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });
  });

  describe('addRole / excludeRole', () => {
    it('success', async () => {
      await expect(service.addRole(mockUser.id, Role.Author)).resolves.toBeUndefined();
      await expect(service.excludeRole(mockUser.id, Role.Author)).resolves.toBeUndefined();
    });

    it('user not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null)
        .mockImplementationOnce(() => null);

      await expect(service.addRole(mockUser.id, Role.Author)).rejects.toThrow(NotFoundException);
      await expect(service.excludeRole(mockUser.id, Role.Author)).rejects.toThrow(NotFoundException);
    });
  });
});
