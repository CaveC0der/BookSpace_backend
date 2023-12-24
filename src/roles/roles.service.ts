import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import RoleModel from './models/role.model';
import { RoleCreationT } from './types/role-creation.type';
import { ValidationError } from 'sequelize';
import { Role } from './role.enum';
import extractOrder from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';
import UsersQueryDto from '../users/dtos/users-query.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(RoleModel) private roleRepo: typeof RoleModel) {}

  async create(dto: RoleCreationT) {
    try {
      return await this.roleRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async get(name: Role) {
    const role = await this.roleRepo.findByPk(name);
    if (!role)
      throw new NotFoundException();
    return role;
  }

  async update(name: Role, description: string) {
    const updated = await this.roleRepo.update({ description }, { where: { name } });
    if (!updated) {
      Logger.error(`updateRole(${name}) failed`, RolesService.name);
      throw new NotFoundException();
    }
  }

  async delete(name: Role) {
    const destroyed = await this.roleRepo.destroy({ where: { name } });
    if (!destroyed) {
      Logger.error(`deleteRole(${name}) failed`, RolesService.name);
      throw new NotFoundException();
    }
  }

  async getAll() {
    return this.roleRepo.findAll();
  }

  async getRoleUsers(name: Role, dto: UsersQueryDto) {
    const role = await this.roleRepo.findByPk(name);
    if (!role)
      throw new NotFoundException();

    return role.$get('users', {
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: toBoolean(dto.eager) ? [RoleModel] : undefined,
    });
  }
}
