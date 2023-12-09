import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export default class GenreDto {
  @ApiProperty()
  @Length(1, 48)
  name: string;
}
