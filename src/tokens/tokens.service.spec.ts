import { TokensService } from './tokens.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import TokenModel from './token.model';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';
import { TokenPayloadT } from './types/token-payload.type';
import { Algorithm } from 'jsonwebtoken';
import { Logger, NotFoundException } from '@nestjs/common';

describe('TokensService', () => {
  let service: TokensService;

  const mockTokenRepo = {
    destroy: jest.fn().mockImplementation(() => 1),
  };
  const mockConfig = {
    COOKIE_NAME: 'mock-cookie',
    JWT_ALGORITHM: 'HS512' as Algorithm,
    JWT_ACCESS_SECRET: 'mock-access-secret',
    JWT_ACCESS_EXPIRES_IN: 'mock-access-exp-in',
    JWT_REFRESH_SECRET: 'mock-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: 'mock-refresh-exp-in',
  };
  const mockTokenPayload: TokenPayloadT = {
    id: 1,
    roles: [],
  };
  const mockSignAsync = async (_: any, options: JwtSignOptions) => `${options.algorithm}__${options.secret}__${options.expiresIn}`;
  const mockJwtService = {
    signAsync: jest.fn().mockImplementation(mockSignAsync),
    verifyAsync: jest.fn().mockImplementation(() => mockTokenPayload),
  };

  beforeAll(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: getModelToken(TokenModel),
          useValue: mockTokenRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractAccessToken', () => {
    it('success', () => {
      expect(service.extractAccessToken({ headers: { authorization: 'Bearer mock-token' } } as Request)).toBe('mock-token');
    });

    it('not found', () => {
      expect(service.extractAccessToken({ headers: {} } as Request)).toBeUndefined();
    });

    it('invalid token type', () => {
      expect(service.extractAccessToken({ headers: { authorization: 'Basic mock-token' } } as Request)).toBeUndefined();
    });
  });

  describe('extractRefreshToken', () => {
    it('success', () => {
      expect(service.extractRefreshToken({ cookies: { [mockConfig.COOKIE_NAME]: 'mock-token' } } as Request)).toBe('mock-token');
    });

    it('not found', () => {
      expect(service.extractRefreshToken({ cookies: {} } as Request)).toBeUndefined();
    });
  });

  describe('genAccessToken / genRefreshToken', () => {
    it('access', async () => {
      await expect(service.genAccessToken(mockTokenPayload)).resolves.toBe(await mockSignAsync(0, {
        algorithm: mockConfig.JWT_ALGORITHM,
        secret: mockConfig.JWT_ACCESS_SECRET,
        expiresIn: mockConfig.JWT_ACCESS_EXPIRES_IN,
      }));
    });

    it('refresh', async () => {
      await expect(service.genRefreshToken(mockTokenPayload)).resolves.toBe(await mockSignAsync(0, {
        algorithm: mockConfig.JWT_ALGORITHM,
        secret: mockConfig.JWT_REFRESH_SECRET,
        expiresIn: mockConfig.JWT_REFRESH_EXPIRES_IN,
      }));
    });
  });

  describe('deleteRefreshToken', () => {
    it('success', async () => {
      await expect(service.deleteRefreshToken(mockTokenPayload.id)).resolves.toBeUndefined();
    });

    it('failed', async () => {
      mockTokenRepo.destroy.mockImplementationOnce(() => 0);

      await expect(service.deleteRefreshToken(mockTokenPayload.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyToken', () => {
    it('success', async () => {
      await expect(service.verifyToken('', 'ACCESS')).resolves.toStrictEqual(mockTokenPayload);
    });

    it('failed', async () => {
      mockJwtService.verifyAsync.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.verifyToken('', 'REFRESH')).resolves.toBeUndefined();
    });
  });
});
