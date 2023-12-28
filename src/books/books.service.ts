import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import BookModel from './models/book.model';
import { literal, Op, ValidationError } from 'sequelize';
import { ViewModel } from './models/view.model';
import BookUpdateDto from './dtos/book-update.dto';
import { WhereOptions } from 'sequelize/types/model';
import FindBooksQueryDto from './dtos/find-books-query.dto';
import { extractBooksOrder } from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';
import { BookGenreModel } from '../genres/models/book-genre.model';
import { FilesService } from '../files/files.service';
import { GenresService } from '../genres/genres.service';
import UserModel from '../users/user.model';
import GenreModel from '../genres/models/genre.model';
import BookCreationDto from './dtos/book-creation.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(BookModel)
              private bookRepo: typeof BookModel,
              @InjectModel(ViewModel)
              private viewRepo: typeof ViewModel,
              @InjectModel(BookGenreModel)
              private bookGenreRepo: typeof BookGenreModel,
              private filesService: FilesService,
              private genresService: GenresService) {}

  async create(authorId: number, dto: BookCreationDto) {
    try {
      const book = await this.bookRepo.create({ name: dto.name, authorId, synopsis: dto.synopsis });
      if (dto.genres)
        await book.$set('genres', await this.genresService.getMany(dto.genres));
      return book;
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async get(bookId: number, userId?: number) {
    if (userId) {
      const view = await this.viewRepo.findOne({ where: { userId, bookId } });
      if (view) {
        view.changed('updatedAt', true);
        await view.save();
      } else
        await this.viewRepo.create({ userId, bookId });
    }

    const book = await this.bookRepo.findByPk(bookId, { include: [UserModel, GenreModel] });
    if (!book)
      throw new NotFoundException();

    return book;
  }

  async update(userId: number, bookId: number, dto: BookUpdateDto, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId && !force)
      throw new ForbiddenException();

    try {
      await book.update({ name: dto.name, synopsis: dto.synopsis });
      if (dto.genres)
        await book.$set('genres', await this.genresService.getMany(dto.genres));
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async delete(userId: number, bookId: number, hard?: boolean, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId && !force)
      throw new ForbiddenException();

    await book.destroy({ force: hard });
  }

  async restore(userId: number, bookId: number, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { paranoid: false });
    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId && !force)
      throw new ForbiddenException();

    await book.restore();
  }

  async setCover(userId: number, bookId: number, file: Express.Multer.File) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId)
      throw new ForbiddenException();

    if (book.cover)
      await this.filesService.delete(book.cover);

    try {
      await book.update({ cover: await this.filesService.save(file) });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async deleteCover(userId: number, bookId: number, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    if (book.cover)
      await this.filesService.delete(book.cover);

    try {
      await book.update({ cover: null });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async addGenres(userId: number, bookId: number, names: string[], force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    await book.$add('genres', await this.genresService.getMany(names));
  }

  async removeGenres(userId: number, bookId: number, names: string[], force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    await book.$remove('genres', await this.genresService.getMany(names));
  }

  async find(where: WhereOptions<BookModel>, dto: FindBooksQueryDto) {
    if (dto.query)
      where = { name: { [Op[dto.mode ?? 'startsWith']]: dto.query, ...where } };

    if (dto.genres)
      where = {
        id: {
          [Op.in]: (await this.bookGenreRepo.findAll({
            attributes: ['bookId'],
            where: { genre: { [Op.in]: dto.genres } },
            group: ['bookId'],
            having: literal(`COUNT(genre) = ${dto.genres.length}`),
          })).map(bg => bg.bookId),
        }, ...where,
      };

    return this.bookRepo.findAll({
      where,
      limit: dto.limit,
      offset: dto.offset,
      order: extractBooksOrder(dto),
      include: toBoolean(dto.eager) ? [UserModel, GenreModel] : GenreModel,
    });
  }
}
