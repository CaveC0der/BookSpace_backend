import { IsOptional, Length, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewUpdateT } from '../types/review-update.type';
import { Cons } from '../review.constraint';

export default class ReviewUpdateDto implements ReviewUpdateT {
  @ApiPropertyOptional({ minimum: Cons.rate.min, maximum: Cons.rate.max })
  @IsOptional()
  @Min(Cons.rate.min)
  @Max(Cons.rate.max)
  rate?: number;

  @ApiPropertyOptional({ minLength: 1, maxLength: Cons.text, example: 'Nice...' })
  @IsOptional()
  @Length(1, Cons.text)
  text?: string;
}
