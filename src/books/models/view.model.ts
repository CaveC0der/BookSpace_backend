import { DataTypes } from 'sequelize';
import { AfterCreate, BelongsTo, Column, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import BookModel from './book.model';
import { Logger } from '@nestjs/common';
import { InDecrementReturnType } from '../../shared/types/indecrement.return.type';
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

  @AfterCreate
  static async afterCreateHook(view: ViewModel) {
    const [[_u, usersAffected]] = await UserModel.increment('viewsCount', {
      where: { id: view.userId },
      by: 1,
    }) as unknown as InDecrementReturnType<UserModel>;
    const [[_b, booksAffected]] = await BookModel.increment('viewsCount', {
      where: { id: view.bookId },
      by: 1,
    }) as unknown as InDecrementReturnType<BookModel>;
    if (!usersAffected || !booksAffected)
      Logger.error('@AfterCreate failed', ViewModel.name);
  }
}
