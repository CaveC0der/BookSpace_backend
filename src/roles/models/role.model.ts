import { BelongsToMany, Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';
import { RoleCreationT } from '../types/role-creation.type';
import { UserRoleModel } from './user-role.model';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import UserModel from '../../users/user.model';
import { Cons } from '../role.constraint';

@Table({ tableName: 'roles', updatedAt: false })
export default class RoleModel extends Model<RoleModel, RoleCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(Cons.name.max), primaryKey: true })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.description) })
  description: string | null;

  @BelongsToMany(() => UserModel, () => UserRoleModel)
  users: UserModel[];

  @CreatedAt
  createdAt: Date;
}
