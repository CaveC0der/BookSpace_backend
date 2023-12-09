import { Role } from '../role.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class RoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  name: Role;
}
