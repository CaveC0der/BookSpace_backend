import { Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export default class GenresDto {
  @ApiProperty({ example: 'Fantasy,Romance', description: 'comma-separated array' })
  @Transform(({ value }) => value.split(','))
  @Length(1, 48, { each: true })
  names: string[];
}
