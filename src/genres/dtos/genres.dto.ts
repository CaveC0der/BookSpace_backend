import { Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Cons } from '../genre.constraint';

export default class GenresDto {
  @ApiProperty({ example: 'Fantasy,Romance', description: 'comma-separated array' })
  @Transform(({ value }) => value.split(','))
  @Length(Cons.name.min, Cons.name.max, { each: true })
  names: string[];
}
