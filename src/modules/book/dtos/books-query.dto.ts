import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../../common/classes/query.dto';
import BookModel from '../book.model';

const orderBy: (keyof BookModel | string)[] = ['name', 'rating', 'author', 'popularity', 'createdAt', 'updatedAt'];

export default class BooksQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: string;
}
