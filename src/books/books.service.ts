import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import BookModel from './models/book.model';
import { col, fn, Op, ValidationError, where } from 'sequelize';
import { ViewModel } from './models/view.model';
import BookUpdateDto from './dtos/book-update.dto';
import { WhereOptions } from 'sequelize/types/model';
import FindBooksQueryDto from './dtos/find-books-query.dto';
import { extractBooksOrder } from '../shared/utils/extract-order';
import { BookGenreModel } from '../genres/models/book-genre.model';
import { FilesService } from '../files/files.service';
import { GenresService } from '../genres/genres.service';
import UserModel from '../users/user.model';
import GenreModel from '../genres/models/genre.model';
import BookCreationDto from './dtos/book-creation.dto';
import iLike from '../shared/utils/i-like';
import throwHttpException from '../shared/utils/throw-http-exception';

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
      if (dto.genres) {
        await book.$set('genres', await this.genresService.getMany(dto.genres));
      }
      return book;
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async get(bookId: number, userId?: number) {
    const book = await this.bookRepo.findByPk(bookId, { include: [{ model: UserModel, as: 'author' }, GenreModel] });
    if (!book) {
      throw new NotFoundException();
    }

    if (userId && userId !== book.authorId) {
      await this.viewRepo.upsert({ userId, bookId });
    }

    return book;
  }

  async update(userId: number, bookId: number, dto: BookUpdateDto, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book) {
      throw new NotFoundException();
    }

    if (book.authorId !== userId && !force) {
      throw new ForbiddenException();
    }

    try {
      await book.update({ name: dto.name, synopsis: dto.synopsis });
      if (dto.genres) {await book.$set('genres', await this.genresService.getMany(dto.genres));}
    } catch (error) {
      throw new BadRequestException(error instanceof ValidationError
        ? error.errors.map(err => err.message)
        : error);
    }
  }

  async delete(userId: number, bookId: number, hard?: boolean, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book) {
      throw new NotFoundException();
    }
    if (book.authorId !== userId && !force) {
      throw new ForbiddenException();
    }
    await book.destroy({ force: !!hard }); // sequelize: force === false
  }

  async restore(userId: number, bookId: number, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { paranoid: false });
    if (!book) {
      throw new NotFoundException();
    }
    if (book.authorId !== userId && !force) {
      throw new ForbiddenException();
    }
    await book.restore();
  }

  async setCover(userId: number, bookId: number, file: Express.Multer.File) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book) {
      throw new NotFoundException();
    }

    if (book.authorId !== userId) {
      throw new ForbiddenException();
    }

    if (book.cover) {
      await this.filesService.delete(book.cover);
    }

    try {
      await book.update({ cover: await this.filesService.save(file) });
    } catch (error) {
      throwHttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCover(userId: number, bookId: number, force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId);
    if (!book || !book.cover) {
      throw new NotFoundException();
    }

    if (userId !== book.authorId && !force) {
      throw new ForbiddenException();
    }

    try {
      await this.filesService.delete(book.cover);
      await book.update({ cover: null });
    } catch (error) {
      throwHttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addGenres(userId: number, bookId: number, names: string[], force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book) {
      throw new NotFoundException();
    }
    if (userId !== book.authorId && !force) {
      throw new ForbiddenException();
    }
    await book.$add('genres', await this.genresService.getMany(names));
  }

  async removeGenres(userId: number, bookId: number, names: string[], force?: boolean) {
    const book = await this.bookRepo.findByPk(bookId, { include: GenreModel });
    if (!book) {
      throw new NotFoundException();
    }
    if (userId !== book.authorId && !force) {
      throw new ForbiddenException();
    }
    await book.$remove('genres', await this.genresService.getMany(names));
  }

  async find(dto: FindBooksQueryDto) {
    const bookWhere: WhereOptions<BookModel> = {};
    if (dto.name) {
      bookWhere.name = iLike(dto.name, dto.nameMode);
    }
    if (dto.genres) {
      bookWhere.id = {
        [Op.in]: (await this.bookGenreRepo.findAll({
          attributes: ['bookId'],
          where: { genre: { [Op.in]: dto.genres } },
          group: ['bookId'],
          having: where(fn('COUNT', col('genre')), dto.genres.length),
        })).map(bg => bg.bookId),
      };
    }

    const userWhere: WhereOptions<UserModel> = {};
    if (dto.author) {
      userWhere.username = iLike(dto.author, dto.authorMode);
    }

    return this.bookRepo.findAll({
      where: bookWhere,
      limit: dto.limit,
      offset: dto.offset,
      order: extractBooksOrder(dto),
      include: (dto.author || dto.eager)
        ? [{ as: 'author', model: UserModel, attributes: ['id', 'username'], where: userWhere }, GenreModel]
        : GenreModel,
      paranoid: dto.paranoid,
    });
  }
}
