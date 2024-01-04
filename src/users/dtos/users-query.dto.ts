import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import QueryDto from '../../shared/classes/query.dto';
import { Transform } from 'class-transformer';
import stringToBoolean from '../../shared/utils/string-to-boolean';

// (keyof UserModel)[]
const orderBy = ['username', 'email', 'rating', 'booksCount', 'reviewsCount'] as const;

export default class UsersQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];

  @ApiPropertyOptional({ description: 'boolean string', example: 'false' })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  @IsBoolean()
  paranoid?: boolean;
}
