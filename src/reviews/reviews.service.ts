import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import ReviewModel from './review.model';
import { ValidationError } from 'sequelize';
import { ReviewUpdateT } from './types/review-update.type';
import ReviewsQueryDto from './dtos/reviews-query.dto';
import { WhereOptions } from 'sequelize/types/model';
import extractOrder from '../shared/utils/extract-order';
import UserModel from '../users/user.model';
import ReviewCreationDto from './dtos/review-creation.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(ReviewModel) private reviewRepo: typeof ReviewModel) {}

  async create(userId: number, dto: ReviewCreationDto) {
    try {
      return await this.reviewRepo.create({ ...dto, userId });
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async get(userId: number, bookId: number) {
    const review = await this.reviewRepo.findOne({ where: { userId, bookId } });
    if (!review) {
      throw new NotFoundException();
    }
    return review;
  }

  async update(userId: number, bookId: number, dto: ReviewUpdateT) {
    const [updated] = await this.reviewRepo.update(
      { rate: dto.rate, text: dto.text },
      { where: { userId, bookId } },
    );
    if (!updated) {
      throw new NotFoundException();
    }
  }

  async delete(initiatorId: number, userId: number, bookId: number, force?: boolean) {
    if (initiatorId !== userId && !force) {
      throw new ForbiddenException();
    }

    const destroyed = await this.reviewRepo.destroy({ where: { userId, bookId } });
    if (!destroyed) {
      throw new NotFoundException();
    }
  }

  async find(where: WhereOptions<ReviewModel>, dto: ReviewsQueryDto) {
    return this.reviewRepo.findAll({
      where,
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: dto.eager ? UserModel : undefined,
    });
  }
}
