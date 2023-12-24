import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import BookModel from '../models/book.model';
import QueryDto from '../../shared/classes/query.dto';

const orderBy: (keyof BookModel | string)[] = ['name', 'rating', 'author', 'popularity', 'createdAt', 'updatedAt'];

export default class BooksQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: string;
}
