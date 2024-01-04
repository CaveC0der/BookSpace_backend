import {
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import UserModel from '../../users/user.model';
import GenreModel from '../../genres/models/genre.model';
import { BookGenreModel } from '../../genres/models/book-genre.model';
import ReviewModel from '../../reviews/review.model';
import CommentModel from '../../comments/comment.model';
import { Cons } from '../book.constraint';

@Table({ tableName: 'books' })
export default class BookModel extends Model<BookModel, BookCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(Cons.name.max), unique: true, allowNull: false })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.filename) })
  cover: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.synopsis) })
  synopsis: string | null;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  rating: number;

  @ApiProperty()
  @Expose()
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
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
  @BelongsTo(() => UserModel, { as: 'author' })
  author: UserModel | undefined;

  @ApiProperty()
  @Expose()
  @BelongsToMany(() => GenreModel, () => BookGenreModel)
  genres: GenreModel[];

  @BelongsToMany(() => UserModel, { as: 'viewers', through: () => ViewModel })
  @Expose()
  viewers: Array<UserModel & { ViewModel: ViewModel }>;

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

  @ApiProperty({ type: Date, nullable: true })
  @Expose()
  @DeletedAt
  deletedAt: Date | null;
}
