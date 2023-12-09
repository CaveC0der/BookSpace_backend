import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import ReviewModel from './review.model';
import { OrderItem, ValidationError } from 'sequelize';
import { ReviewCreationT } from './types/review-creation.type';
import { ReviewUpdateT } from './types/review-update.type';
import ReviewsQueryDto from './dtos/reviews-query.dto';
import { WhereOptions } from 'sequelize/types/model';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(ReviewModel) private reviewRepo: typeof ReviewModel) {}

  async createReview(userId: number, dto: ReviewCreationT) {
    try {
      return await this.reviewRepo.create({ ...dto, userId });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async getReview(userId: number, bookId: number) {
    const review = await this.reviewRepo.findOne({ where: { userId, bookId } });
    if (!review)
      throw new NotFoundException();
    return review;
  }

  async updateReview(userId: number, dto: ReviewUpdateT) {
    const updated = await this.reviewRepo.update(
      { rate: dto.rate, text: dto.text },
      { where: { userId, bookId: dto.bookId } },
    );
    Logger.log(`reviews updated: ${updated}`, ReviewService.name);
    if (!updated) {
      Logger.error(`updateReview(${userId}, ${dto.bookId}) failed`, ReviewService.name);
      throw new NotFoundException();
    }
  }

  async deleteReview(initiatorId: number, userId: number, bookId: number, force?: boolean) {
    if (initiatorId !== userId && !force)
      throw new ForbiddenException();

    const destroyed = await this.reviewRepo.destroy({ where: { userId, bookId } });
    Logger.log(`reviews destroyed: ${destroyed}`, ReviewService.name);
    if (!destroyed) {
      Logger.error(`deleteReview(${userId}, ${bookId}) failed`, ReviewService.name);
      throw new NotFoundException();
    }
  }

  async find(where: WhereOptions<ReviewModel>, dto: ReviewsQueryDto) {
    const order: OrderItem[] | undefined = dto.orderBy
      ? dto.orderDirection
        ? [[dto.orderBy, dto.orderDirection]]
        : [dto.orderBy]
      : undefined;

    try {
      return await this.reviewRepo.findAll({
        where,
        limit: dto.limit,
        offset: dto.offset,
        order,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
