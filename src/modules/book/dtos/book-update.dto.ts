import { IsOptional, Length } from 'class-validator';
import { BookUpdateT } from '../types/book-update.type';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class BookUpdateDto implements BookUpdateT {
  @ApiPropertyOptional({ minLength: 1, maxLength: 255, example: 'Amazing adventure' })
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 500, example: 'Far away...' })
  @IsOptional()
  @Length(1, 255)
  synopsis?: string;
}
