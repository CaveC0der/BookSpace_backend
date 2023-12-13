import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../../common/classes/query.dto';
import CommentModel from '../comment.model';

const orderBy: (keyof CommentModel)[] = ['createdAt', 'updatedAt'];

export default class CommentsQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: string;
}
