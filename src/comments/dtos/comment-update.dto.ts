import { CommentUpdateT } from '../types/comment-update.type';
import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class CommentUpdateDto implements CommentUpdateT {
  @ApiProperty()
  @Length(1, 1000)
  text: string;
}
