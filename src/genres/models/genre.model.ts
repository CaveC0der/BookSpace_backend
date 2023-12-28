import { BelongsToMany, Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';
import { GenreCreationT } from '../types/genre-creation.type';
import { BookGenreModel } from './book-genre.model';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import BookModel from '../../books/models/book.model';
import { Cons } from '../genre.constraint';

@Table({ tableName: 'genres', updatedAt: false })
export default class GenreModel extends Model<GenreModel, GenreCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(Cons.name.max), primaryKey: true })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(Cons.description) })
  description: string | null;

  @BelongsToMany(() => BookModel, () => BookGenreModel)
  books: BookModel[];

  @CreatedAt
  createdAt: Date;
}
