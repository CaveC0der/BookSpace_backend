import {
  AfterCreate,
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
import { Role } from '../roles/role.enum';

@Table({ tableName: 'users' })
export default class UserModel extends Model<UserModel, UserCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(64), allowNull: false })
  username: string;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  password: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(48) })
  avatar: string | null;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(500) })
  bio: string | null;

  @ApiProperty()
  @Expose()
  @Column({ type: DataType.DECIMAL(5, 3), allowNull: false, defaultValue: 0 })
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

  @HasMany(() => BookModel, { foreignKey: 'authorId' }) // authored books
  books: BookModel[];

  @HasMany(() => ViewModel) // viewed books
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
  static async assignDefaultRole(instance: UserModel) {
    await instance.$add('roles', Role.Reader);
  }
}