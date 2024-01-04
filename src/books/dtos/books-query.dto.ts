import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import QueryDto from '../../shared/classes/query.dto';
import { Transform } from 'class-transformer';
import stringToBoolean from '../../shared/utils/string-to-boolean';

// (keyof BookModel | string)[]
const orderBy = ['name', 'rating', 'author', 'popularity', 'createdAt', 'updatedAt'] as const;

export default class BooksQueryDto extends QueryDto {
  @ApiPropertyOptional({ enum: orderBy })
  @IsIn(orderBy)
  orderBy?: typeof orderBy[number];

  @ApiPropertyOptional({ description: 'boolean string', example: 'false' })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  @IsBoolean()
  paranoid?: boolean;
}
