import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import UserModel from './user.model';
import { UserCreationT } from './types/user-creation.type';
import { Includeable, ValidationError } from 'sequelize';
import RoleModel from '../role/role.model';
import UserUpdateDto from './dtos/user-update.dto';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '../config/config.service';
import { FileService } from '../file/file.service';
import { Role } from '../role/role.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserModel)
              private userRepo: typeof UserModel,
              private config: ConfigService,
              private fileService: FileService) {}

  async create(dto: UserCreationT) {
    try {
      return await this.userRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async safeGetById(id: number, include?: Includeable[]) {
    const user = await this.getById(id, include);
    if (!user)
      throw new NotFoundException();
    return user;
  }

  async safeGetByEmail(email: string, include?: Includeable[]) {
    const user = await this.getByEmail(email, include);
    if (!user)
      throw new NotFoundException();
    return user;
  }

  async getById(id: number, include?: Includeable[]) {
    return this.userRepo.findByPk(id, { include });
  }

  async getByEmail(email: string, include?: Includeable[]) {
    return this.userRepo.findOne({ where: { email }, include });
  }

  async update(id: number, dto: UserUpdateDto) {
    dto.password &&= await bcryptjs.hash(dto.password, this.config.HASH_PASSWORD_SALT);

    const user = await this.userRepo.findByPk(id);
    if (!user)
      throw new NotFoundException();

    try {
      await user.update({ username: dto.username, email: dto.email, password: dto.password, bio: dto.bio });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async delete(id: number, hard?: boolean) {
    const destroyed = await this.userRepo.destroy({ where: { id }, force: hard });
    Logger.log(`users destroyed: ${destroyed}`, UserService.name);
    if (!destroyed) {
      Logger.error(`delete(${id}) failed`, UserService.name);
      throw new NotFoundException();
    }
  }

  async restore(id: number) {
    try {
      await this.userRepo.restore({ where: { id } });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async setAvatar(id: number, file: Express.Multer.File) {
    const user = await this.userRepo.findByPk(id);
    if (!user)
      throw new NotFoundException();

    if (user.avatar)
      await this.fileService.delete(user.avatar);

    try {
      await user.update({ avatar: await this.fileService.save(file) });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async deleteAvatar(id: number) {
    const user = await this.userRepo.findByPk(id);
    if (!user)
      throw new NotFoundException();

    if (user.avatar)
      await this.fileService.delete(user.avatar);

    try {
      await user.update({ avatar: null });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async addRole(id: number, name: Role) {
    const user = await this.userRepo.findByPk(id, { include: RoleModel });
    if (!user)
      throw new NotFoundException();

    await user.$add('roles', name);
  }

  async excludeRole(id: number, name: Role) {
    const user = await this.userRepo.findByPk(id, { include: RoleModel });
    if (!user)
      throw new NotFoundException();

    await user.$remove('roles', name);
  }
}
