import { IsBooleanString, IsIn, IsOptional, Length, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { OrderDirections } from '../../../common/constants/order-directions';
import { Op } from 'sequelize';

const modes: (keyof typeof Op)[] = ['startsWith', 'substring', 'endsWith', 'iLike'];

const orderBy = ['name', 'rating', 'author', 'popularity', 'createdAt', 'updatedAt'];

export default class BooksQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 150)
  query?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  mode?: keyof typeof Op;

  @ApiPropertyOptional({ example: ['Fantasy'] })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? [value] : value)
  @Length(1, 48, { each: true })
  genres?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: orderBy })
  @IsOptional()
  @IsIn(orderBy)
  orderBy?: string;

  @ApiPropertyOptional({ enum: OrderDirections })
  @IsOptional()
  @IsIn(OrderDirections)
  orderDirection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  eager?: string;
}
