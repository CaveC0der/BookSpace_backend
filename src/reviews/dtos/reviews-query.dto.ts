import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../shared/classes/query.dto';

// (keyof ReviewModel)[]
const orderBy = ['rate', 'createdAt', 'updatedAt'] as const;

export default class ReviewsQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];
}
