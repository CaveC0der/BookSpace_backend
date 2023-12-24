import { IsOptional, Length, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewUpdateT } from '../types/review-update.type';

export default class ReviewUpdateDto implements ReviewUpdateT {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Min(1)
  @Max(5)
  rate?: number;

  @ApiPropertyOptional({ minLength: 1, maxLength: 2000, example: 'Nice...' })
  @IsOptional()
  @Length(1, 2000)
  text?: string;
}
