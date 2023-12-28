import { BookCreationT } from '../types/book-creation.type';
import { IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class BookCreationDto implements Omit<BookCreationT, 'authorId'> {
  @ApiProperty({ minLength: 1, maxLength: 255, example: 'Amazing adventure' })
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 500, example: 'Far away...' })
  @IsOptional()
  @Length(1, 500)
  synopsis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 48, { each: true })
  genres?: string[];
}
