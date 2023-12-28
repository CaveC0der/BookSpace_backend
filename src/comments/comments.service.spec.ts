import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import CommentModel from './comment.model';
import UserModel from '../users/user.model';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_new-password',
  };
  const mockComment = {
    id: 1,
    userId: 1,
    bookId: 1,
    text: 'That was wonderful',
    update: jest.fn(),
    destroy: jest.fn(),
  };
  const returnMockComment = jest.fn().mockImplementation(() => mockComment);
  const mockCommentRepo = {
    create: returnMockComment,
    findByPk: returnMockComment,
    findAll: jest.fn().mockImplementation(() => [mockComment]),
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
        CommentsService,
        {
          provide: getModelToken(CommentModel),
          useValue: mockCommentRepo,
        },
      ],
    }).compile();

    service = module.get(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('success', async () => {
      await expect(service.create(mockUser.id, mockComment)).resolves.toStrictEqual(mockComment);
    });

    it('validation error', async () => {
      mockCommentRepo.create.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.create(mockUser.id, mockComment)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('success', async () => {
      await expect(service.get(mockComment.id)).resolves.toStrictEqual(mockComment);
    });

    it('not found', async () => {
      mockCommentRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.get(mockComment.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('success', async () => {
      await expect(service.update(mockUser.id, mockComment.id, '')).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.update(0, mockComment.id, '')).rejects.toThrow(ForbiddenException);
    });

    it('not found', async () => {
      mockCommentRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.update(mockUser.id, mockComment.id, '')).rejects.toThrow(NotFoundException);
    });

    it('update failed', async () => {
      mockComment.update.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.update(mockUser.id, mockComment.id, '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('success', async () => {
      await expect(service.delete(mockUser.id, mockComment.id)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.delete(0, mockComment.id)).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.delete(0, mockComment.id, true)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockCommentRepo.findByPk.mockImplementationOnce(() => null);

      await expect(service.delete(mockUser.id, mockComment.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('success', async () => {
      await expect(service.find({}, {})).resolves.toBeInstanceOf(Array);
    });

    it('eager', async () => {
      await service.find({}, { eager: 'true' });

      expect(mockCommentRepo.findAll).toHaveBeenCalledWith({
        where: {},
        limit: undefined,
        offset: undefined,
        order: undefined,
        include: UserModel,
      });
    });
  });
});
