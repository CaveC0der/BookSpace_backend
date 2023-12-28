import { DataTypes } from 'sequelize';
import { BelongsTo, Column, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import BookModel from './book.model';
import UserModel from '../../users/user.model';

export type ViewCreationT = {
  userId: number
  bookId: number
}

@Table({ tableName: 'views', createdAt: false })
export class ViewModel extends Model<ViewModel, ViewCreationT> {
  @ForeignKey(() => UserModel)
  @Column({ type: DataTypes.INTEGER, primaryKey: true })
  userId: number;

  @ForeignKey(() => BookModel)
  @Column({ type: DataTypes.INTEGER, primaryKey: true })
  bookId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => BookModel)
  book: BookModel;

  @UpdatedAt
  updatedAt: Date;
}
