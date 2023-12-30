import { IsBooleanString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class DeleteDto {
  @ApiPropertyOptional({ description: 'boolean string', example: 'false' })
  @IsOptional()
  @IsBooleanString()
  hard?: 'true' | 'false' | '1' | '0';
}
