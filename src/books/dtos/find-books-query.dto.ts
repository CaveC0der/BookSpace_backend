import BooksQueryDto from './books-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';
import { Op } from 'sequelize';
import { Transform } from 'class-transformer';
import { Cons as BCons } from '../book.constraint';
import { Cons as GCons } from '../../genres/genre.constraint';

const modes: (keyof typeof Op)[] = ['startsWith', 'substring', 'endsWith', 'iLike'];

export default class FindBooksQueryDto extends BooksQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, BCons.name.max)
  query?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  mode?: keyof typeof Op;

  @ApiPropertyOptional({ example: 'Fantasy,Romance', description: 'comma-separated array' })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @Length(GCons.name.min, GCons.name.max, { each: true })
  genres?: string[];
}
