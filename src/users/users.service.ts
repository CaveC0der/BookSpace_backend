import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import UserModel from './user.model';
import { UserCreationT } from './types/user-creation.type';
import { col, fn, Includeable, Op, ValidationError, where } from 'sequelize';
import UserUpdateDto from './dtos/user-update.dto';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '../config/config.service';
import { FilesService } from '../files/files.service';
import { Role } from '../roles/role.enum';
import RoleModel from '../roles/models/role.model';
import { FindAttributeOptions, WhereOptions } from 'sequelize/types/model';
import extractOrder, { extractBooksOrder } from '../shared/utils/extract-order';
import GenreModel from '../genres/models/genre.model';
import iLike from '../shared/utils/i-like';
import { UserRoleModel } from '../roles/models/user-role.model';
import FindUsersQueryDto from './dtos/find-users-query.dto';
import BooksQueryDto from '../books/dtos/books-query.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel)
              private userRepo: typeof UserModel,
              @InjectModel(UserRoleModel)
              private userRoleRepo: typeof UserRoleModel,
              private config: ConfigService,
              private filesService: FilesService) {}

  async create(dto: UserCreationT) {
    try {
      return await this.userRepo.create(dto);
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async safeGetById(id: number, include?: Includeable[], attributes?: FindAttributeOptions) {
    const user = await this.getById(id, include, attributes);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async safeGetByEmail(email: string, include?: Includeable[], attributes?: FindAttributeOptions) {
    const user = await this.getByEmail(email, include, attributes);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async getById(id: number, include?: Includeable[], attributes?: FindAttributeOptions) {
    return this.userRepo.findByPk(id, { include, attributes });
  }

  async getByEmail(email: string, include?: Includeable[], attributes?: FindAttributeOptions) {
    return this.userRepo.findOne({ where: { email }, include, attributes });
  }

  async getCreateGet(dto: UserCreationT) {
    return this.userRepo.findCreateFind({ where: { email: dto.email }, defaults: dto });
  }

  async update(id: number, dto: UserUpdateDto) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new NotFoundException();
    }

    dto.password &&= await bcryptjs.hash(dto.password, this.config.SALT_LENGTH);

    try {
      await user.update({ username: dto.username, email: dto.email, password: dto.password, bio: dto.bio });
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async delete(id: number, hard?: boolean) {
    const destroyed = await this.userRepo.destroy({ where: { id }, force: hard });
    if (!destroyed) {
      throw new NotFoundException();
    }
  }

  async restore(id: number) {
    const user = await this.userRepo.findByPk(id, { paranoid: false });
    if (!user) {
      throw new NotFoundException();
    }
    await user.restore();
  }

  async setAvatar(id: number, file: Express.Multer.File) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new NotFoundException();
    }

    if (user.avatar) {
      await this.filesService.delete(user.avatar);
    }

    try {
      await user.update({ avatar: await this.filesService.save(file) });
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async deleteAvatar(id: number) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new NotFoundException();
    }

    if (user.avatar) {
      await this.filesService.delete(user.avatar);
    } else {
      return;
    }

    try {
      await user.update({ avatar: null });
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async getBooks(id: number, type: 'authored' | 'viewed', dto: BooksQueryDto) {
    return (await this.safeGetById(id, undefined, ['id'])).$get(type, {
      limit: dto.limit,
      offset: dto.offset,
      order: extractBooksOrder(dto),
      include: dto.eager ? [GenreModel] : undefined,
      paranoid: dto.paranoid,
    });
  }

  async addRole(id: number, name: Role) {
    const user = await this.userRepo.findByPk(id, { include: RoleModel });
    if (!user) {
      throw new NotFoundException();
    }
    await user.$add('roles', name);
  }

  async excludeRole(id: number, name: Role) {
    const user = await this.userRepo.findByPk(id, { include: RoleModel });
    if (!user) {
      throw new NotFoundException();
    }
    await user.$remove('roles', name);
  }

  async find(dto: FindUsersQueryDto) {
    const userWhere: WhereOptions<UserModel> = {};
    if (dto.username) {
      userWhere.username = iLike(dto.username, dto.usernameMode);
    }

    if (dto.email) {
      userWhere.email = iLike(dto.email, dto.emailMode);
    }

    if (dto.roles) {
      userWhere.id = {
        [Op.in]: (await this.userRoleRepo.findAll({
          attributes: ['userId'],
          where: { role: { [Op.in]: dto.roles } },
          group: ['userId'],
          having: where(fn('COUNT', col('role')), dto.roles.length),
        })).map(ur => ur.userId),
      };
    }

    return this.userRepo.findAll({
      where: userWhere,
      limit: dto.limit,
      offset: dto.offset,
      order: extractOrder(dto),
      include: dto.eager ? RoleModel : undefined,
      paranoid: dto.paranoid,
    });
  }
}
