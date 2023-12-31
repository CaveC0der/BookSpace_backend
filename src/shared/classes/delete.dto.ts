import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import stringToBoolean from '../utils/string-to-boolean';

export default class DeleteDto {
  @ApiPropertyOptional({ description: 'boolean string', example: 'false' })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  @IsBoolean()
  hard?: boolean;
}
