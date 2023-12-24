import { GenreCreationT } from '../types/genre-creation.type';
import { IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class GenreCreationDto implements GenreCreationT {
  @ApiProperty({ minLength: 1, maxLength: 48, example: 'Mystery' })
  @Length(1, 48)
  name: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 255, example: 'Mysterious...' })
  @IsOptional()
  @Length(1, 255)
  description?: string;
}
