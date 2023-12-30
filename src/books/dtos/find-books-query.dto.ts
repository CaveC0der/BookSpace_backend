import BooksQueryDto from './books-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { Cons as BCons } from '../book.constraint';
import { Cons as GCons } from '../../genres/genre.constraint';

// keyof typeof Op from sequelize
const modes = ['startsWith', 'substring', 'endsWith', 'iLike'] as const;

export default class FindBooksQueryDto extends BooksQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(1, BCons.name.max)
  query?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  @IsIn(modes)
  mode?: typeof modes[number];

  @ApiPropertyOptional({ example: 'Fantasy,Romance', description: 'comma-separated array' })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @Length(GCons.name.min, GCons.name.max, { each: true })
  genres?: string[];
}
