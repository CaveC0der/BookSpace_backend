import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { SequelizeModule } from '@nestjs/sequelize';
import BookModel from './models/book.model';
import { ViewModel } from './models/view.model';
import { BooksController } from './books.controller';
import { BookGenreModel } from '../genres/models/book-genre.model';
import { FilesModule } from '../files/files.module';
import { GenresModule } from '../genres/genres.module';

@Module({
  imports: [SequelizeModule.forFeature([BookModel, ViewModel, BookGenreModel]), FilesModule, GenresModule],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
