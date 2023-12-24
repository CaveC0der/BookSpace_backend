import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import ReviewModel from './review.model';
import { ValidationError } from 'sequelize';
import { ReviewCreationT } from './types/review-creation.type';
import { ReviewUpdateT } from './types/review-update.type';
import ReviewsQueryDto from './dtos/reviews-query.dto';
import { WhereOptions } from 'sequelize/types/model';
import extractOrder from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';
import UserModel from '../users/user.model';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(ReviewModel) private reviewRepo: typeof ReviewModel) {}

  async create(userId: number, dto: ReviewCreationT) {
    try {
      return await this.reviewRepo.create({ ...dto, userId });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async get(userId: number, bookId: number) {
    const review = await this.reviewRepo.findOne({ where: { userId, bookId } });
    if (!review)
      throw new NotFoundException();
    return review;
  }

  async update(userId: number, bookId: number, dto: ReviewUpdateT) {
    const updated = await this.reviewRepo.update(
      { rate: dto.rate, text: dto.text },
      { where: { userId, bookId } },
    );
    if (!updated) {
      Logger.error(`updateReview(${userId}, ${bookId}) failed`, ReviewsService.name);
      throw new NotFoundException();
    }
  }

  async delete(initiatorId: number, userId: number, bookId: number, force?: boolean) {
    if (initiatorId !== userId && !force)
      throw new ForbiddenException();

    const destroyed = await this.reviewRepo.destroy({ where: { userId, bookId } });
    if (!destroyed) {
      Logger.error(`deleteReview(${userId}, ${bookId}) failed`, ReviewsService.name);
      throw new NotFoundException();
    }
  }

  async find(where: WhereOptions<ReviewModel>, dto: ReviewsQueryDto) {
    return this.reviewRepo.findAll({
      where,
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: toBoolean(dto.eager) ? UserModel : undefined,
    });
  }
}
