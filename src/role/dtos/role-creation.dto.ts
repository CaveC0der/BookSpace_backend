import { IsOptional, Length } from 'class-validator';
import { RoleCreationT } from '../types/role-creation.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class RoleCreationDto implements RoleCreationT {
  @ApiProperty({ minLength: 1, maxLength: 32, example: 'Ruler' })
  @Length(1, 32)
  name: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 150, example: 'Can do everything...' })
  @IsOptional()
  @Length(1, 150)
  description?: string;
}
