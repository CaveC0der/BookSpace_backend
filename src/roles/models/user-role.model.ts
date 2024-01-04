import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import RoleModel from './role.model';
import UserModel from '../../users/user.model';
import { Cons } from '../role.constraint';

@Table({ tableName: 'users_roles', timestamps: false })
export class UserRoleModel extends Model {
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  userId: number;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.STRING(Cons.name.max), primaryKey: true })
  role: string;
}
