import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ReviewCreationT } from './types/review-creation.type';
import { Logger } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { InDecrementReturnType } from '../shared/types/indecrement.return.type';
import UserModel from '../users/user.model';
import BookModel from '../books/models/book.model';

@Table({ tableName: 'reviews' })
export default class ReviewModel extends Model<ReviewModel, ReviewCreationT> {
  @ApiProperty()
  @Expose()
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  userId: number;

  @ApiProperty()
  @Expose()
  @ForeignKey(() => BookModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  bookId: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 0 })
  rate: number;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(2000) })
  text: string | null;

  @ApiPropertyOptional({ type: () => UserModel })
  @Expose()
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
}
