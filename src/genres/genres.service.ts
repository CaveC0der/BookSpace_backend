import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Op, ValidationError } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import GenreModel from './models/genre.model';
import { GenreCreationT } from './types/genre-creation.type';
import { extractBooksOrder } from '../shared/utils/extract-order';
import BooksQueryDto from '../books/dtos/books-query.dto';
import UserModel from '../users/user.model';

@Injectable()
export class GenresService {
  constructor(@InjectModel(GenreModel) private genreRepo: typeof GenreModel) {}

  async create(dto: GenreCreationT) {
    try {
      return await this.genreRepo.create(dto);
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async get(name: string) {
    const genre = await this.genreRepo.findByPk(name);
    if (!genre) {
      throw new NotFoundException();
    }
    return genre;
  }

  // returns all if names is undefined
  async getMany(names?: string[]) {
    return this.genreRepo.findAll({ where: names && { name: { [Op.in]: names } } });
  }

  async update(name: string, description: string) {
    const [updated] = await this.genreRepo.update({ description }, { where: { name } });
    if (!updated) {
      throw new NotFoundException();
    }
  }

  async delete(name: string) {
    const destroyed = await this.genreRepo.destroy({ where: { name } });
    if (!destroyed) {
      throw new NotFoundException();
    }
  }

  async getGenreBooks(name: string, dto: BooksQueryDto) {
    const genre = await this.genreRepo.findByPk(name);
    if (!genre) {
      throw new NotFoundException();
    }

    return genre.$get('books', {
      limit: dto.limit,
      offset: dto.offset,
      order: extractBooksOrder(dto),
      include: dto.eager
        ? [{ as: 'author', model: UserModel, attributes: ['id', 'username'] }, GenreModel]
        : [GenreModel],
    });
  }
}
