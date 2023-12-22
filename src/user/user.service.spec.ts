import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import UserModel from './user.model';
import { ConfigService } from '../config/config.service';
import { FileService } from '../file/file.service';
import * as bcryptjs from 'bcryptjs';
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { Role } from '../role/role.enum';

describe('UserService', () => {
  let service: UserService;

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
  };
  const returnMockUser = jest.fn().mockImplementation(() => mockUser);
  const mockUserRepo = {
    create: returnMockUser,
    findByPk: returnMockUser,
    findOne: returnMockUser,
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
        UserService,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('normal', async () => {
      await expect(service.create({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      })).resolves.toStrictEqual(mockUser);
    });

    it('validation error / already exists', async () => {
      mockUserRepo.create.mockImplementationOnce(() => { throw mockValidationError;});

      await expect(service.create({
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('normal', async () => {
      await expect(service.safeGetById(mockUser.id)).resolves.toStrictEqual(mockUser);
      await expect(service.safeGetByEmail(mockUser.email)).resolves.toStrictEqual(mockUser);
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);
      mockUserRepo.findOne.mockImplementationOnce(() => null);

      await expect(service.safeGetById(mockUser.id)).rejects.toThrow(NotFoundException);
      await expect(service.safeGetByEmail(mockUser.email)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('normal', async () => {
      await expect(service.update(mockUser.id, { password: 'new-password' })).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.update(mockUser.id, { password: 'new-password' })).rejects.toThrow(NotFoundException);
    });

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.update(mockUser.id, { password: 'new-password' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('normal', async () => {
      await expect(service.delete(mockUser.id)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.destroy.mockImplementationOnce(() => 0);

      await expect(service.delete(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('normal', async () => {
      await expect(service.restore(mockUser.id)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockUserRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.restore(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setAvatar', () => {
    it('normal', async () => {
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

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.setAvatar(mockUser.id, mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAvatar', () => {
    it('normal', async () => {
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

    it('update failed', async () => {
      mockUser.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.deleteAvatar(mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addRole / excludeRole', () => {
    it('normal', async () => {
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
