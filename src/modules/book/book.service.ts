import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import BookModel from './book.model';
import { BookCreationT } from './types/book-creation.type';
import { ValidationError } from 'sequelize';
import { FileService } from '../file/file.service';
import GenreModel from '../genre/genre.model';
import { GenreService } from '../genre/genre.service';
import { ViewModel } from './view.model';
import BookUpdateDto from './dtos/book-update.dto';

@Injectable()
export class BookService {
  constructor(@InjectModel(BookModel)
              private bookRepo: typeof BookModel,
              @InjectModel(ViewModel)
              private viewRepo: typeof ViewModel,
              private fileService: FileService,
              private genreService: GenreService) {}

  async createBook(authorId: number, dto: BookCreationT) {
    try {
      return await this.bookRepo.create({ ...dto, authorId });
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async getBook(bookId: number, userId?: number) {
    if (userId) {
      try {
        const [view, created] = await this.viewRepo.findOrCreate({
          where: { userId, bookId },
          defaults: { userId, bookId },
        });
        if (!created)
          await view.update({ updatedAt: new Date() });
      } catch (error) {
        if (error instanceof ValidationError)
          error = error.errors.map(err => err.message);
        throw new BadRequestException(error);
      }
    }

    const book = await this.bookRepo.findByPk(bookId);

    if (!book)
      throw new NotFoundException();

    return book;
  }

  async updateBook(userId: number, bookId: number, dto: BookUpdateDto, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);

    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId && !force)
      throw new UnauthorizedException();

    try {
      await book.update(dto);
    } catch (error) {
      if (error instanceof ValidationError)
        error = error.errors.map(err => err.message);
      throw new BadRequestException(error);
    }
  }

  async setBookCover(userId: number, bookId: number, file: Express.Multer.File) {
    const book = await this.bookRepo.findByPk(bookId);

    if (!book)
      throw new NotFoundException();

    if (book.authorId !== userId)
      throw new UnauthorizedException();

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

    const genre = await this.genreService.getGenre(name);

    await book.$add('genres', genre);
  }

  async excludeGenre(userId: number, bookId: number, name: string, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });

    if (!book)
      throw new NotFoundException();

    if (userId !== book.authorId && !force)
      throw new ForbiddenException();

    const genre = await this.genreService.getGenre(name);

    // todo - exclude genre
  }
}
