import { GenreUpdateT } from '../types/genre-update.type';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class GenreUpdateDto implements GenreUpdateT {
  @ApiProperty()
  @Length(1, 250)
  description: string;
}
