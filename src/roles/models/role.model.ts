import { BelongsToMany, Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';
import { RoleCreationT } from '../types/role-creation.type';
import { UserRoleModel } from './user-role.model';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import UserModel from '../../users/user.model';

@Table({ tableName: 'roles', updatedAt: false })
export default class RoleModel extends Model<RoleModel, RoleCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(32), primaryKey: true })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(150) })
  description: string | null;

  @BelongsToMany(() => UserModel, () => UserRoleModel)
  users: UserModel[];

  @CreatedAt
  createdAt: Date;
}
