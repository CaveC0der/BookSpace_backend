import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsIn, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

const OrderDirections = ['ASC', 'DESC'] as const;

const orderBy: string[] = [];

export default class QueryDto {
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
  orderDirection?: typeof OrderDirections[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  eager?: 'true' | 'false' | '1' | '0';
}
