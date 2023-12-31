import BooksQueryDto from './books-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { Cons as BCons } from '../book.constraint';
import { Cons as GCons } from '../../genres/genre.constraint';
import { Cons as UCons } from '../../users/user.constraint';

// keyof typeof Op from sequelize
const modes = ['startsWith', 'substring', 'endsWith'] as const;

export default class FindBooksQueryDto extends BooksQueryDto {
  @ApiPropertyOptional({ description: 'name of a book' })
  @IsOptional()
  @Length(1, BCons.name.max)
  name?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  @IsIn(modes)
  nameMode?: typeof modes[number];

  @ApiPropertyOptional({ description: 'username of an author' })
  @IsOptional()
  @Length(1, UCons.username.max)
  author?: string;

  @ApiPropertyOptional({ enum: modes })
  @IsOptional()
  @IsIn(modes)
  authorMode?: typeof modes[number];

  @ApiPropertyOptional({ type: String, example: 'Fantasy,Romance', description: 'comma-separated array' })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @Length(GCons.name.min, GCons.name.max, { each: true })
  genres?: string[];
}
