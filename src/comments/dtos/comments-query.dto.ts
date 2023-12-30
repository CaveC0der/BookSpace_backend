import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../shared/classes/query.dto';

// (keyof CommentModel)[]
const orderBy = ['createdAt', 'updatedAt'] as const;

export default class CommentsQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];
}
