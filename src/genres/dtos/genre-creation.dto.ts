import { GenreCreationT } from '../types/genre-creation.type';
import { IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cons } from '../genre.constraint';

export default class GenreCreationDto implements GenreCreationT {
  @ApiProperty({ minLength: Cons.name.min, maxLength: Cons.name.max, example: 'Mystery' })
  @Length(Cons.name.min, Cons.name.max)
  name: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: Cons.description, example: 'Mysterious...' })
  @IsOptional()
  @Length(1, Cons.description)
  description?: string;
}
