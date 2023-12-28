import { ReviewCreationT } from '../types/review-creation.type';
import { IsOptional, Length, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cons } from '../review.constraint';

export default class ReviewCreationDto implements Omit<ReviewCreationT, 'userId'> {
  @ApiProperty({ minimum: 1 })
  @Min(1)
  bookId: number;

  @ApiProperty({ minimum: Cons.rate.min, maximum: Cons.rate.max })
  @Min(Cons.rate.min)
  @Max(Cons.rate.max)
  rate: number;

  @ApiPropertyOptional({ minLength: 1, maxLength: Cons.text, example: 'Nice...' })
  @IsOptional()
  @Length(1, Cons.text)
  text?: string;
}
