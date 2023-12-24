import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import ReviewModel from '../review.model';
import QueryDto from '../../shared/classes/query.dto';

const orderBy: (keyof ReviewModel)[] = ['rate', 'createdAt', 'updatedAt'];

export default class ReviewsQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: string;
}
