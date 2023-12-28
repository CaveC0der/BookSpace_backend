import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { ReviewCreationT } from './types/review-creation.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import UserModel from '../users/user.model';
import BookModel from '../books/models/book.model';
import { Cons } from './review.constraint';

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
  @Column({ type: DataType.SMALLINT, allowNull: false })
  rate: number;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.text) })
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
