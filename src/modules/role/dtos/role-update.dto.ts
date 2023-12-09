import { RoleUpdateT } from '../types/role-update.type';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export default class RoleUpdateDto implements RoleUpdateT {
  @ApiProperty({ minLength: 1, maxLength: 150, example: 'Can do everything...' })
  @Length(1, 150)
  description: string;
}
