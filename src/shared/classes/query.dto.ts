import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrderableT } from '../types/orderable.type';
import stringToBoolean from '../utils/string-to-boolean';

const OrderDirections = ['ASC', 'DESC'] as const;

export default abstract class QueryDto implements OrderableT {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'boolean string', example: 'true' })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  @IsBoolean()
  eager?: boolean;

  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ enum: OrderDirections })
  @IsOptional()
  @IsIn(OrderDirections)
  orderDirection?: typeof OrderDirections[number];
}
