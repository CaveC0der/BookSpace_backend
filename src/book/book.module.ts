import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import BookModel from './book.model';
import { FileModule } from '../file/file.module';
import { GenreModule } from '../genre/genre.module';
import { ViewModel } from './view.model';
import { BookGenreModel } from '../genre/book-genre.model';

@Module({
  imports: [SequelizeModule.forFeature([BookModel, ViewModel, BookGenreModel]), FileModule, GenreModule],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}
