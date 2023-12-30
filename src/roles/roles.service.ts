import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import RoleModel from './models/role.model';
import { Role } from './role.enum';
import extractOrder from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';
import UsersQueryDto from '../users/dtos/users-query.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(RoleModel) private roleRepo: typeof RoleModel) {}

  async get(name: Role) {
    const role = await this.roleRepo.findByPk(name);
    if (!role) {
      throw new NotFoundException();
    }
    return role;
  }

  async update(name: Role, description: string) {
    const updated = await this.roleRepo.update({ description }, { where: { name } });
    if (!updated) {
      Logger.error(`updateRole(${name}) failed`, RolesService.name);
      throw new NotFoundException();
    }
  }

  async getAll() {
    return this.roleRepo.findAll();
  }

  async getRoleUsers(name: Role, dto: UsersQueryDto) {
    const role = await this.roleRepo.findByPk(name);
    if (!role) {
      throw new NotFoundException();
    }

    return role.$get('users', {
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: toBoolean(dto.eager) ? [RoleModel] : undefined,
    });
  }
}
