import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import UserModel from '../user/user.model';
import RoleModel from './role.model';

@Table({ tableName: 'users_roles', timestamps: false })
export class UserRoleModel extends Model {
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id: number;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.STRING(32), primaryKey: true })
  role: string;
}
