import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import UserModel from '../user.model';
import QueryDto from '../../shared/classes/query.dto';

const orderBy: (keyof UserModel)[] = ['username', 'email', 'rating', 'booksCount', 'reviewsCount'];

export default class UsersQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsOptional()
  @IsIn(orderBy)
  orderBy?: string;
}
