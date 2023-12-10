import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import UserModel from '../user/user.model';

export type TTokenCreation = {
  value: string
}

@Table({ tableName: 'tokens' })
export default class TokenModel extends Model<TokenModel, TTokenCreation> {
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  userId: number;

  @Column({ type: DataType.STRING(500), allowNull: false })
  value: string;

  @BelongsTo(() => UserModel)
  user: UserModel | undefined;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
