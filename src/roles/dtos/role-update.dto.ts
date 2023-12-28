import { RoleUpdateT } from '../types/role-update.type';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Cons } from '../role.constraint';

export default class RoleUpdateDto implements RoleUpdateT {
  @ApiProperty({ minLength: 1, maxLength: Cons.description, example: 'Can do everything...' })
  @Length(1, Cons.description)
  description: string;
}
