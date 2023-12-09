import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ValidationError } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import GenreModel from './genre.model';
import { GenreCreationT } from './types/genre-creation.type';

@Injectable()
export class GenreService {
  constructor(@InjectModel(GenreModel) private genreRepo: typeof GenreModel) {}

  async createGenre(dto: GenreCreationT) {
    try {
      return await this.genreRepo.create(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async getGenre(name: string) {
    const genre = await this.genreRepo.findByPk(name);
    if (!genre)
      throw new NotFoundException();
    return genre;
  }

  async updateGenre(name: string, description: string) {
    const updated = await this.genreRepo.update({ description }, { where: { name } });
    Logger.log(`genres updated: ${updated}`, GenreService.name);
    if (!updated) {
      Logger.error(`updateGenre(${name}) failed`, GenreService.name);
      throw new NotFoundException();
    }
  }

  async deleteGenre(name: string) {
    const destroyed = await this.genreRepo.destroy({ where: { name } });
    Logger.log(`genres destroyed: ${destroyed}`, GenreService.name);
    if (!destroyed) {
      Logger.error(`deleteGenre(${name}) failed`, GenreService.name);
      throw new NotFoundException();
    }
  }

  async getAllGenres() {
    return this.genreRepo.findAll();
  }
}
