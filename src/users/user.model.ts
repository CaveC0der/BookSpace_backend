import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserCreationT } from './types/user-creation.type';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import TokenModel from '../tokens/token.model';
import RoleModel from '../roles/models/role.model';
import { UserRoleModel } from '../roles/models/user-role.model';
import BookModel from '../books/models/book.model';
import { ViewModel } from '../books/models/view.model';
import ReviewModel from '../reviews/review.model';
import CommentModel from '../comments/comment.model';
import { Cons } from './user.constraint';

@Table({ tableName: 'users' })
export default class UserModel extends Model<UserModel, UserCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(Cons.username.max), allowNull: false })
  username: string;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING(Cons.password.max), allowNull: false })
  password: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.filename) })
  avatar: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.bio) })
  bio: string | null;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  rating: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 0 })
  booksCount: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  viewsCount: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.SMALLINT, allowNull: false, defaultValue: 0 })
  reviewsCount: number;

  @HasOne(() => TokenModel)
  token: TokenModel | undefined;

  @ApiProperty()
  @Expose()
  @BelongsToMany(() => RoleModel, () => UserRoleModel)
  roles: RoleModel[];

  @HasMany(() => BookModel, { as: 'authored' })
  authored: BookModel[];

  @BelongsToMany(() => BookModel, { as: 'viewed', through: () => ViewModel })
  viewed: BookModel[];

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
