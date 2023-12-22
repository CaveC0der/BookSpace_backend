import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import BookModel from './book.model';
import { BookCreationT } from './types/book-creation.type';
import { literal, Op, ValidationError } from 'sequelize';
import { FileService } from '../file/file.service';
import GenreModel from '../genre/genre.model';
import { GenreService } from '../genre/genre.service';
import { ViewModel } from './view.model';
import BookUpdateDto from './dtos/book-update.dto';
import { WhereOptions } from 'sequelize/types/model';
import UserModel from '../user/user.model';
import { BookGenreModel } from '../genre/book-genre.model';
import FindBooksQueryDto from './dtos/find-books-query.dto';
import { extractBooksOrder } from '../shared/utils/extract-order';
import toBoolean from '../shared/utils/toBoolean';

@Injectable()
export class BookService {
  constructor(@InjectModel(BookModel)
              private bookRepo: typeof BookModel,
              @InjectModel(ViewModel)
              private viewRepo: typeof ViewModel,
              @InjectModel(BookGenreModel)
              private bookGenreRepo: typeof BookGenreModel,
              private fileService: FileService,
              private genreService: GenreService) {}

  async create(authorId: number, dto: BookCreationT) {
    try {
      return await this.bookRepo.create({ ...dto, authorId });
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
      await book.update(dto);
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
      await this.fileService.delete(book.cover);

    try {
      await book.update({ cover: await this.fileService.save(file) });
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
      await this.fileService.delete(book.cover);

    try {
      await book.update({ cover: null });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async addGenre(userId: number, bookId: number, name: string, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    await book.$add('genres', await this.genreService.get(name));
  }

  async excludeGenre(userId: number, bookId: number, name: string, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    await book.$remove('genres', await this.genreService.get(name));
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
