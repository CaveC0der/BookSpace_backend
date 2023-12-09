import { ReviewCreationT } from '../types/review-creation.type';
import { IsOptional, Length, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class ReviewCreationDto implements ReviewCreationT {
  @ApiProperty({ minimum: 1 })
  @Min(1)
  bookId: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Min(1)
  @Max(5)
  rate: number;

  @ApiPropertyOptional({ minLength: 1, maxLength: 2000, example: 'Nice...' })
  @IsOptional()
  @Length(1, 2000)
  text?: string;
}
