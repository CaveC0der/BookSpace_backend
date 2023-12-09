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
import TokenModel from '../token/token.model';
import BookModel from '../book/book.model';
import { ViewModel } from '../book/view.model';
import ReviewModel from '../review/review.model';
import CommentModel from '../comment/comment.model';
import { UserCreationT } from './types/user-creation.type';
import { Role } from '../role/role.enum';
import RoleModel from '../role/role.model';
import { UserRoleModel } from '../role/user-role.model';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  token: TokenModel | null;

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
