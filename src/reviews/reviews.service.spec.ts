import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import ReviewModel from './review.model';
import UserModel from '../users/user.model';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockUser = {
    id: 1,
    username: 'mock',
    email: 'mock@mail.com',
    password: 'hashed_8_new-password',
  };
  const mockReview = {
    userId: 1,
    bookId: 1,
    rate: 5,
    text: 'That was wonderful',
  };
  const returnMockReview = jest.fn().mockImplementation(() => mockReview);
  const mockReviewRepo = {
    create: returnMockReview,
    findOne: returnMockReview,
    update: jest.fn().mockImplementation(() => [1]),
    destroy: jest.fn().mockImplementation(() => 1),
    findAll: jest.fn().mockImplementation(() => [mockReview]),
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
        ReviewsService,
        {
          provide: getModelToken(ReviewModel),
          useValue: mockReviewRepo,
        },
      ],
    }).compile();

    service = module.get(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('success', async () => {
      await expect(service.create(mockUser.id, mockReview)).resolves.toStrictEqual(mockReview);
    });

    it('create failed (validation)', async () => {
      mockReviewRepo.create.mockImplementationOnce(() => { throw mockValidationError; });

      await expect(service.create(mockUser.id, mockReview)).rejects.toThrow(BadRequestException);
    });

    it('create failed', async () => {
      mockReviewRepo.create.mockImplementationOnce(() => { throw new Error(); });

      await expect(service.create(mockUser.id, mockReview)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('success', async () => {
      await expect(service.get(mockUser.id, mockReview.bookId)).resolves.toStrictEqual(mockReview);
    });

    it('not fount', async () => {
      mockReviewRepo.findOne.mockImplementationOnce(() => null);

      await expect(service.get(mockUser.id, mockReview.bookId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('success', async () => {
      await expect(service.update(mockUser.id, mockReview.bookId, { rate: 4 })).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockReviewRepo.update.mockImplementationOnce(() => [0]);

      await expect(service.update(mockUser.id, mockReview.bookId, { rate: 4 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('success', async () => {
      await expect(service.delete(mockUser.id, mockUser.id, mockReview.bookId)).resolves.toBeUndefined();
    });

    it('not author', async () => {
      await expect(service.delete(0, mockUser.id, mockReview.bookId)).rejects.toThrow(ForbiddenException);
    });

    it('not author + admin', async () => {
      await expect(service.delete(0, mockUser.id, mockReview.bookId, true)).resolves.toBeUndefined();
    });

    it('not found', async () => {
      mockReviewRepo.destroy.mockImplementationOnce(() => 0);

      await expect(service.delete(mockUser.id, mockUser.id, mockReview.bookId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('success', async () => {
      await expect(service.find({}, {})).resolves.toBeInstanceOf(Array);
    });

    it('eager', async () => {
      await service.find({}, { eager: true });

      expect(mockReviewRepo.findAll).toHaveBeenCalledWith({
        where: {},
        limit: undefined,
        offset: undefined,
        order: undefined,
        include: UserModel,
      });
    });
  });
});
