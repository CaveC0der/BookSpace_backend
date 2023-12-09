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
import UserModel from '../user/user.model';
import BookModel from '../book/book.model';
import { ReviewCreationT } from './types/review-creation.type';
import { Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => BookModel)
  book: BookModel;

  @ApiProperty()
  @Expose()
  @CreatedAt
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @UpdatedAt
  updatedAt: Date;

  @AfterCreate
  static async afterCreateHook(review: ReviewModel) {
    const book = await review.$get('book');
    if (!book) {
      Logger.error(`@AfterCreate failed (book not found)`, ReviewModel.name);
      return;
    }
    const newReviewsCount = book.reviewsCount + 1;
    await book.update({
      rating: ((book.rating * book.reviewsCount) + review.rate) / newReviewsCount,
      reviewsCount: newReviewsCount,
    });

    const [_, affected] = await UserModel.decrement('reviewsCount', { where: { id: review.userId }, by: 1 });
    if (!affected)
      Logger.error('@AfterCreate failed', ReviewModel.name);
    else
      Logger.log(`Users affected: ${affected}`, ReviewModel.name);
  }

  @AfterUpdate
  static async afterUpdateHook(review: ReviewModel) {
    const book = await review.$get('book');
    if (!book) {
      Logger.error(`@AfterUpdate failed (book not found)`, ReviewModel.name);
      return;
    }
    const previous = Number(review.previous('rate'));
    if (isNaN(previous)) {
      Logger.error(`@AfterUpdate failed (previous rate is undefined)`, ReviewModel.name);
      return;
    }
    await book.update({
      rating: ((book.rating * book.reviewsCount) - previous + review.rate) / book.reviewsCount,
    });
  }

  @AfterDestroy
  static async afterDestroyHook(review: ReviewModel) {
    const [_u, usersAffected] = await UserModel.decrement('reviewsCount', { where: { id: review.userId }, by: 1 });
    const [_b, booksAffected] = await BookModel.decrement('reviewsCount', { where: { id: review.bookId }, by: 1 });
    if (!usersAffected || !booksAffected)
      Logger.error('@AfterDestroy failed', ReviewModel.name);
    else
      Logger.log(`Users affected: ${usersAffected}, Books affected: ${booksAffected}`, ReviewModel.name);
  }
}
