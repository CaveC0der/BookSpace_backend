import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../shared/classes/query.dto';

// (keyof BookModel | string)[]
const orderBy = ['name', 'rating', 'author', 'popularity', 'createdAt', 'updatedAt'] as const;

export default class BooksQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];
}
