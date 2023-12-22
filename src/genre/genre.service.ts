import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ValidationError } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import GenreModel from './genre.model';
import { GenreCreationT } from './types/genre-creation.type';
import BooksQueryDto from '../book/dtos/books-query.dto';
import UserModel from '../user/user.model';
import { extractBooksOrder } from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';

@Injectable()
export class GenreService {
  constructor(@InjectModel(GenreModel) private genreRepo: typeof GenreModel) {}

  async create(dto: GenreCreationT) {
    try {
      return await this.genreRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async get(name: string) {
    const genre = await this.genreRepo.findByPk(name);
    if (!genre)
      throw new NotFoundException();
    return genre;
  }

  async update(name: string, description: string) {
    const updated = await this.genreRepo.update({ description }, { where: { name } });
    Logger.log(`genres updated: ${updated}`, GenreService.name);
    if (!updated) {
      Logger.error(`updateGenre(${name}) failed`, GenreService.name);
      throw new NotFoundException();
    }
  }

  async delete(name: string) {
    const destroyed = await this.genreRepo.destroy({ where: { name } });
    Logger.log(`genres destroyed: ${destroyed}`, GenreService.name);
    if (!destroyed) {
      Logger.error(`deleteGenre(${name}) failed`, GenreService.name);
      throw new NotFoundException();
    }
  }

  async getAll() {
    return this.genreRepo.findAll();
  }

  async getGenreBooks(name: string, dto: BooksQueryDto) {
    const genre = await this.genreRepo.findByPk(name);
    if (!genre)
      throw new NotFoundException();

    return genre.$get('books', {
      limit: dto.limit,
      offset: dto.offset,
      order: extractBooksOrder(dto),
      include: toBoolean(dto.eager) ? [UserModel] : undefined,
    });
  }
}
