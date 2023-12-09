import { Length, Min } from 'class-validator';
import { CommentCreationT } from '../types/comment-creation.type';
import { ApiProperty } from '@nestjs/swagger';

export default class CommentCreationDto implements CommentCreationT {
  @ApiProperty({ minimum: 1 })
  @Min(1)
  bookId: number;

  @ApiProperty({ required: false, minLength: 1, maxLength: 1000, example: 'Nice...' })
  @Length(1, 1000)
  text: string;
}