import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async createUser(dto: UserCreationT) {
    try {
      return await this.userRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async safeGetUserById(id: number, include?: Includeable[]) {
    const user = await this.getUserById(id, include);

    if (!user)
      throw new NotFoundException();

    console.log(user.roles);

    return user;
  }

  async safeGetUserByEmail(email: string, include?: Includeable[]) {
    const user = await this.getUserByEmail(email, include);

    if (!user)
      throw new NotFoundException();

    return user;
  }

  async getUserById(id: number, include?: Includeable[]) {
    return this.userRepo.findByPk(id, { include });
  }

  async getUserByEmail(email: string, include?: Includeable[]) {
    return this.userRepo.findOne({ where: { email }, include });
  }

  async updateUser(id: number, dto: UserUpdateDto) {
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

  async deleteAvatar(issuerId: number, userId: number, force?: boolean) {
    const user = await this.userRepo.findByPk(userId);

    if (!user)
      throw new NotFoundException();

    if (issuerId !== user.id && !force)
      throw new ForbiddenException();

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
