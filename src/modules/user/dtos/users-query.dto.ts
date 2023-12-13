import QueryDto from '../../../common/classes/query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import UserModel from '../user.model';

const orderBy: (keyof UserModel)[] = ['username', 'email', 'rating', 'booksCount', 'reviewsCount'];

export default class UsersQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsOptional()
  @IsIn(orderBy)
  orderBy?: string;
}
