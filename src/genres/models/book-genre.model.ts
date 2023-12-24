import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import GenreModel from './genre.model';
import BookModel from '../../books/models/book.model';

@Table({ tableName: 'books_genres', timestamps: false })
export class BookGenreModel extends Model {
  @ForeignKey(() => BookModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  bookId: number;

  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.STRING(48), primaryKey: true })
  genre: string;
}
