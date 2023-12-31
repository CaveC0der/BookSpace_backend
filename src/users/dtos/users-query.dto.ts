import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import QueryDto from '../../shared/classes/query.dto';

// (keyof UserModel)[]
const orderBy = ['username', 'email', 'rating', 'booksCount', 'reviewsCount'] as const;

export default class UsersQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];
}
