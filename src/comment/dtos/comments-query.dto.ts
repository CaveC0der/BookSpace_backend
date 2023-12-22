import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import CommentModel from '../comment.model';
import QueryDto from '../../shared/classes/query.dto';

const orderBy: (keyof CommentModel)[] = ['createdAt', 'updatedAt'];

export default class CommentsQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: string;
}
