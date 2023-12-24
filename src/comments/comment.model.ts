import {
  AfterCreate,
  AfterDestroy,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CommentCreationT } from './types/comment-creation.type';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Logger } from '@nestjs/common';
import { InDecrementReturnType } from '../shared/types/indecrement.return.type';
import UserModel from '../users/user.model';
import BookModel from '../books/models/book.model';

@Table({ tableName: 'comments' })
export default class CommentModel extends Model<CommentModel, CommentCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(1000), allowNull: false, defaultValue: '' })
  text: string;

  @ApiProperty()
  @Expose()
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @ApiProperty()
  @Expose()
  @ForeignKey(() => BookModel)
  @Column({ type: DataType.INTEGER })
  bookId: number;

  @BelongsTo(() => UserModel)
  user: UserModel | undefined;

  @BelongsTo(() => BookModel)
  book: BookModel | undefined;

  @ApiProperty()
  @Expose()
  @CreatedAt
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @UpdatedAt
  updatedAt: Date;

  @AfterCreate
  static async afterCreateHook(comment: CommentModel) {
    const [[_, affected]] = await BookModel.increment('commentsCount', {
      where: { id: comment.bookId },
      by: 1,
    }) as unknown as InDecrementReturnType<BookModel>;
    if (!affected)
      Logger.error('@AfterCreate failed', CommentModel.name);
    else
      Logger.log(`Books affected: ${affected}`, CommentModel.name);
  }

  @AfterDestroy
  static async afterDestroyHook(comment: CommentModel) {
    const [[_, affected]] = await BookModel.decrement('commentsCount', {
      where: { id: comment.bookId },
      by: 1,
    }) as unknown as InDecrementReturnType<BookModel>;
    if (!affected)
      Logger.error('@AfterDestroy failed', CommentModel.name);
    else
      Logger.log(`Books affected: ${affected}`, CommentModel.name);
  }
}
