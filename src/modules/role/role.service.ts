import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import RoleModel from './role.model';
import { RoleCreationT } from './types/role-creation.type';
import { ValidationError } from 'sequelize';
import { Role } from './role.enum';

@Injectable()
export class RoleService {
  constructor(@InjectModel(RoleModel) private roleRepo: typeof RoleModel) {}

  async createRole(dto: RoleCreationT) {
    try {
      return await this.roleRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async getRole(name: Role) {
    const role = await this.roleRepo.findByPk(name);
    if (!role)
      throw new NotFoundException();
    return role;
  }

  async updateRole(name: string, description: string) {
    const updated = await this.roleRepo.update({ description }, { where: { name }});
    Logger.log(`roles updated: ${updated}`, RoleService.name);
    if (!updated) {
      Logger.error(`updateRole(${name}) failed`, RoleService.name);
      throw new NotFoundException();
    }
  }

  async deleteRole(name: string) {
    const destroyed = await this.roleRepo.destroy({ where: { name } });
    Logger.log(`roles destroyed: ${destroyed}`, RoleService.name);
    if (!destroyed) {
      Logger.error(`deleteRole(${name}) failed`, RoleService.name);
      throw new NotFoundException();
    }
  }

  async getAllRoles() {
    return this.roleRepo.findAll();
  }
}
