import { BookCreationT } from '../types/book-creation.type';
import { IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cons as BCons } from '../book.constraint';
import { Cons as GCons } from '../../genres/genre.constraint';

export default class BookCreationDto implements Omit<BookCreationT, 'authorId'> {
  @ApiProperty({ minLength: BCons.name.min, maxLength: BCons.name.max, example: 'Amazing adventure' })
  @Length(BCons.name.min, BCons.name.max)
  name: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: BCons.name.max, example: 'Far away...' })
  @IsOptional()
  @Length(1, BCons.name.max)
  synopsis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(GCons.name.min, GCons.name.max, { each: true })
  genres?: string[];
}
