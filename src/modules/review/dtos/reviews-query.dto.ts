import { IsBooleanString, IsIn, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderDirections } from '../../../common/constants/order-directions';

const orderBy = ['rate', 'createdAt', 'updatedAt'];

export default class ReviewsQueryDto {
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
