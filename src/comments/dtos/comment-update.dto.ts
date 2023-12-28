import { CommentUpdateT } from '../types/comment-update.type';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Cons } from '../comment.constraint';

export default class CommentUpdateDto implements CommentUpdateT {
  @ApiProperty({ minLength: 1, maxLength: Cons.text, example: 'Nice...' })
  @Length(1, Cons.text)
  text: string;
}
