import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { Cons as UCons } from '../user.constraint';
import UsersQueryDto from './users-query.dto';
import { Role } from '../../roles/role.enum';

// keyof typeof Op from sequelize
const modes = ['startsWith', 'substring', 'endsWith'] as const;

export default class FindUsersQueryDto extends UsersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, UCons.username.max)
  username?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  @IsIn(modes)
  usernameMode?: typeof modes[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 255)
  email?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  @IsIn(modes)
  emailMode?: typeof modes[number];

  @ApiPropertyOptional({ type: Role, example: 'Author,Restricted', description: 'comma-separated array' })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
