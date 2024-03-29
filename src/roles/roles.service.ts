import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import RoleModel from './models/role.model';
import { Role } from './role.enum';
import extractOrder from '../shared/utils/extract-order';
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
    const [updated] = await this.roleRepo.update({ description }, { where: { name } });
    if (!updated) {
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
      include: dto.eager ? [RoleModel] : undefined,
    });
  }
}
