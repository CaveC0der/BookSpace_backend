import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { BadRequestException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import SignupResponseDto from './dtos/signup-response.dto';
import LoginResponseDto from './dtos/login-response.dto';
import { TokenPayloadT } from '../tokens/types/token-payload.type';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockSignupDto = {
    username: 'mock',
    email: 'mock@mail.com',
    password: 'mock-secret',
  };
  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_mock-secret',
    token: null as any,
    roles: [{ name: 'Reader' }],
    $get: jest.fn().mockImplementation(() => [{ name: 'Reader' }]),
    $create: jest.fn(),
  };
  const returnMockUser = jest.fn().mockImplementation(() => mockUser);
  const mockUserService = {
    create: returnMockUser,
    getByEmail: returnMockUser,
    safeGetByEmail: returnMockUser,
    safeGetById: returnMockUser,
    getCreateGet: jest.fn().mockImplementation(() => [mockUser, false]),
  };
  const mockConfig = { SALT_LENGTH: 8 };
  const mockTokenService = {
    genTokens: jest.fn().mockImplementation((p: TokenPayloadT) => ({
      accessToken: `${p.id}-access-token`,
      refreshToken: `${p.id}-refresh-token`,
    })),
    deleteRefreshToken: jest.fn(),
  };

  beforeAll(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
    jest.spyOn(bcryptjs, 'hash').mockImplementation((str: string, saltLength: number) => `hashed_${saltLength}_${str}`);
    jest.spyOn(bcryptjs, 'compare').mockImplementation(() => true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: TokensService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('success', async () => {
      mockUserService.getCreateGet.mockImplementationOnce(() => [mockUser, true]);

      await expect(service.signup(mockSignupDto)).resolves.toStrictEqual({
        dto: new SignupResponseDto({ id: 1, roles: ['Reader'] }, '1-access-token'),
        refreshToken: '1-refresh-token',
      });
    });

    it('user already exists', async () => {
      await expect(service.signup(mockSignupDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('success', async () => {
      await expect(service.login(mockSignupDto)).resolves.toStrictEqual({
        dto: new LoginResponseDto({ id: 1, roles: ['Reader'] }, mockUser.username, '1-access-token'),
        refreshToken: '1-refresh-token',
      });
    });

    it('not found', async () => {
      mockUserService.safeGetByEmail.mockImplementationOnce(() => { throw new NotFoundException(); });

      await expect(service.login(mockSignupDto)).rejects.toThrow(NotFoundException);
    });

    it('invalid password', async () => {
      jest.spyOn(bcryptjs, 'compare').mockImplementationOnce(() => false);

      await expect(service.login(mockSignupDto)).rejects.toThrow(BadRequestException);
    });

    it('token exists', async () => {
      mockUser.token = { update: jest.fn() };

      await expect(service.login(mockSignupDto)).resolves.toStrictEqual({
        dto: new LoginResponseDto({ id: 1, roles: ['Reader'] }, mockUser.username, '1-access-token'),
        refreshToken: '1-refresh-token',
      });
      expect(mockUser.token.update).toHaveBeenCalledWith({ value: '1-refresh-token' });
    });
  });

  describe('refresh', () => {
    it('success', async () => {
      mockUser.token = { value: '1-refresh-token', update: jest.fn() };

      await expect(service.refresh(mockUser.id, '1-refresh-token')).resolves.toStrictEqual({
        dto: new LoginResponseDto({ id: 1, roles: ['Reader'] }, mockUser.username, '1-access-token'),
        refreshToken: '1-refresh-token',
      });
      expect(mockUser.token.update).toHaveBeenCalledWith({ value: '1-refresh-token' });
    });

    it('not found', async () => {
      mockUserService.safeGetById.mockImplementationOnce(() => { throw new NotFoundException(); });

      await expect(service.refresh(mockUser.id, '1-refresh-token')).rejects.toThrow(NotFoundException);
    });

    it('token does not exists', async () => {
      mockUser.token = null;

      await expect(service.refresh(mockUser.id, '1-refresh-token')).rejects.toThrow(UnauthorizedException);
    });

    it('token does not match token in db', async () => {
      mockUser.token = { value: '1-refresh-token' };

      await expect(service.refresh(mockUser.id, 'invalid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('success', async () => {
      await expect(service.logout(mockUser.id)).resolves.toBeUndefined();
    });
  });
});
