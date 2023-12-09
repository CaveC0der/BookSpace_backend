import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import CommentModel from './comment.model';
import { OrderItem, ValidationError } from 'sequelize';
import { CommentCreationT } from './types/comment-creation.type';
import { WhereOptions } from 'sequelize/types/model';
import CommentsQueryDto from './dtos/comments-query.dto';

@Injectable()
export class CommentService {
  constructor(@InjectModel(CommentModel) private commentRepo: typeof CommentModel) {}

  async createComment(userId: number, dto: CommentCreationT) {
    try {
      return await this.commentRepo.create({ ...dto, userId });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async getComment(id: number) {
    const comment = await this.commentRepo.findByPk(id);
    if (!comment)
      throw new NotFoundException();
    return comment;
  }

  async updateComment(userId: number, commentId: number, text: string) {
    const comment = await this.commentRepo.findByPk(commentId);

    if (!comment)
      throw new NotFoundException();

    if (userId !== comment.userId)
      throw new ForbiddenException();

    try {
      await comment.update({ text });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async deleteComment(userId: number, commentId: number, force?: boolean) {
    const comment = await this.commentRepo.findByPk(commentId);

    if (!comment)
      throw new NotFoundException();

    if (userId !== comment.userId && !force)
      throw new ForbiddenException();

    await comment.destroy();
  }

  async find(where: WhereOptions<CommentModel>, dto: CommentsQueryDto) {
    const order: OrderItem[] | undefined = dto.orderBy
      ? dto.orderDirection
        ? [[dto.orderBy, dto.orderDirection]]
        : [dto.orderBy]
      : undefined;

    try {
      return await this.commentRepo.findAll({
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
