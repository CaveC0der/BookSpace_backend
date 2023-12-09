import { BelongsToMany, Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';
import BookModel from '../book/book.model';
import { GenreCreationT } from './types/genre-creation.type';
import { BookGenreModel } from './book-genre.model';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'genres', updatedAt: false })
export default class GenreModel extends Model<GenreModel, GenreCreationT> {
  @ApiProperty()
  @Expose()
  @Column({ type: DataType.STRING(48), primaryKey: true })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  @Column({ type: DataType.STRING(250) })
  description: string | null;

  @BelongsToMany(() => BookModel, () => BookGenreModel)
  books: BookModel[];

  @CreatedAt
  createdAt: Date;
}
