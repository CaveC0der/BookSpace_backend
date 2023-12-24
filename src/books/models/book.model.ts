import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ViewModel } from './view.model';
import { BookCreationT } from '../types/book-creation.type';
import { Logger } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { InDecrementReturnType } from '../../shared/types/indecrement.return.type';
import UserModel from '../../users/user.model';
import GenreModel from '../../genres/models/genre.model';
import { BookGenreModel } from '../../genres/models/book-genre.model';
import ReviewModel from '../../reviews/review.model';
import CommentModel from '../../comments/comment.model';

@Table({ tableName: 'books' })
export default class BookModel extends Model<BookModel, BookCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(150), unique: true, allowNull: false })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(48) })
  cover: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(500) })
  synopsis: string | null;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.DECIMAL(5, 3), allowNull: false, defaultValue: 0 })
  rating: number;

  @ApiProperty()
  @Expose()
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER })
  authorId: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  viewsCount: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 0 })
  reviewsCount: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 0 })
  commentsCount: number;

  @ApiPropertyOptional({ type: () => UserModel })
  @Expose()
  @BelongsTo(() => UserModel)
  author: UserModel | undefined;

  @ApiProperty()
  @Expose()
  @BelongsToMany(() => GenreModel, () => BookGenreModel)
  genres: GenreModel[];

  @HasMany(() => ViewModel)
  views: ViewModel[];

  @HasMany(() => ReviewModel)
  reviews: ReviewModel[];

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @ApiProperty()
  @Expose()
  @CreatedAt
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @AfterCreate
  static async updateRatingAfterCreate(book: BookModel) {
    const author = await book.$get('author');
    if (!author) {
      Logger.error(`@AfterCreate failed (user not found)`, BookModel.name);
      return;
    }
    const newBooksCount = author.booksCount + 1;
    await author.update({
      rating: ((author.rating * author.booksCount) + book.rating) / newBooksCount,
      booksCount: newBooksCount,
    });
  }

  @AfterUpdate
  static async afterUpdateHook(book: BookModel) {
    const author = await book.$get('author');
    if (!author) {
      Logger.error(`@AfterUpdate failed (user not found)`, BookModel.name);
      return;
    }
    const previous = Number(book.previous('rating'));
    if (isNaN(previous)) {
      Logger.error(`@AfterUpdate failed (previous rating is undefined)`, BookModel.name);
      return;
    }
    await author.update({
      rating: ((author.rating * author.booksCount) - previous + book.rating) / author.booksCount,
    });
  }

  @AfterDestroy
  static async afterDestroyHook(book: BookModel) {
    const [[_, affected]] = await UserModel.decrement('booksCount', {
      where: { id: book.authorId },
      by: 1,
    }) as unknown as InDecrementReturnType<UserModel>;
    if (!affected)
      Logger.error('@AfterDestroy failed', BookModel.name);
    else
      Logger.log(`Users affected: ${affected}`, BookModel.name);
  }
}
