import { Length, Min } from 'class-validator';
import { CommentCreationT } from '../types/comment-creation.type';
import { ApiProperty } from '@nestjs/swagger';
import { Cons } from '../comment.constraint';

export default class CommentCreationDto implements Omit<CommentCreationT, 'userId'> {
  @ApiProperty({ minimum: 1 })
  @Min(1)
  bookId: number;

  @ApiProperty({ minLength: 1, maxLength: Cons.text, example: 'Nice...' })
  @Length(1, Cons.text)
  text: string;
}