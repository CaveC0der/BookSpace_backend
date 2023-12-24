import { RolesService } from './roles.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import RoleModel from './models/role.model';
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Role } from './role.enum';
import UsersQueryDto from '../users/dtos/users-query.dto';

describe('RolesService', () => {
  let service: RolesService;

  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_new-password',
  };
  const mockRole = {
    name: Role.Admin,
    $get: jest.fn().mockImplementation(() => [mockUser]),
  };
  const returnMockRole = jest.fn().mockImplementation(() => mockRole);
  const returnAffectedMockRoles = jest.fn().mockImplementation(() => 1);
  const mockRoleRepo = {
    create: returnMockRole,
    findByPk: returnMockRole,
    update: returnAffectedMockRoles,
    destroy: returnAffectedMockRoles,
    findAll: jest.fn().mockImplementation(() => [mockRole]),
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
        RolesService,
        {
          provide: getModelToken(RoleModel),
          useValue: mockRoleRepo,
        },
      ],
    }).compile();

    service = module.get(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('normal', async () => {
      await expect(service.create(mockRole)).resolves.toStrictEqual(mockRole);
    });

    it('validation error / already exists', async () => {
      mockRoleRepo.create.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.create(mockRole)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('normal', async () => {
      await expect(service.get(mockRole.name)).resolves.toStrictEqual(mockRole);
    });

    it('not found', async () => {
      mockRoleRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.get(mockRole.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('normal', async () => {
      await expect(service.update(mockRole.name, '')).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockRoleRepo.update.mockImplementationOnce(() => 0);

      await expect(service.update(mockRole.name, '')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('normal', async () => {
      await expect(service.delete(mockRole.name)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockRoleRepo.update.mockImplementationOnce(() => 0);

      await expect(service.delete(mockRole.name)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('normal', async () => {
      await expect(service.getAll()).resolves.toBeInstanceOf(Array);
    });
  });

  describe('getRoleUsers', () => {
    it('normal', async () => {
      await expect(service.getRoleUsers(mockRole.name, {})).resolves.toBeInstanceOf(Array);
    });

    it('role not found', async () => {
      mockRoleRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.getRoleUsers(mockRole.name, {})).rejects.toThrow(NotFoundException);
    });

    it('eager', async () => {
      const dto = { eager: 'true' } as UsersQueryDto;
      await service.getRoleUsers(mockRole.name, dto);

      expect(mockRole.$get).toHaveBeenCalledWith('users', {
        include: [RoleModel],
        limit: undefined,
        offset: undefined,
        order: undefined,
      });
    });
  });
});
