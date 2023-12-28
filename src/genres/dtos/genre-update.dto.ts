import { GenreUpdateT } from '../types/genre-update.type';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Cons } from '../genre.constraint';

export default class GenreUpdateDto implements GenreUpdateT {
  @ApiProperty()
  @Length(1, Cons.description)
  description: string;
}
