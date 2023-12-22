import BooksQueryDto from './books-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';
import { Op } from 'sequelize';
import { Transform } from 'class-transformer';

const modes: (keyof typeof Op)[] = ['startsWith', 'substring', 'endsWith', 'iLike'];

export default class FindBooksQueryDto extends BooksQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, 150)
  query?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  mode?: keyof typeof Op;

  @ApiPropertyOptional({ example: ['Fantasy'] })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? [value] : value)
  @Length(1, 48, { each: true })
  genres?: string[];
}
