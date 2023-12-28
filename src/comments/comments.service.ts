import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import CommentModel from './comment.model';
import { ValidationError } from 'sequelize';
import { WhereOptions } from 'sequelize/types/model';
import CommentsQueryDto from './dtos/comments-query.dto';
import extractOrder from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';
import UserModel from '../users/user.model';
import CommentCreationDto from './dtos/comment-creation.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(CommentModel) private commentRepo: typeof CommentModel) {}

  async create(userId: number, dto: CommentCreationDto) {
    try {
      return await this.commentRepo.create({ ...dto, userId });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async get(id: number) {
    const comment = await this.commentRepo.findByPk(id);
    if (!comment)
      throw new NotFoundException();
    return comment;
  }

  async update(userId: number, commentId: number, text: string) {
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

  async delete(userId: number, commentId: number, force?: boolean) {
    const comment = await this.commentRepo.findByPk(commentId);
    if (!comment)
      throw new NotFoundException();

    if (userId !== comment.userId && !force)
      throw new ForbiddenException();

    await comment.destroy();
  }

  async find(where: WhereOptions<CommentModel>, dto: CommentsQueryDto) {
    return this.commentRepo.findAll({
      where,
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: toBoolean(dto.eager) ? UserModel : undefined,
    });
  }
}
