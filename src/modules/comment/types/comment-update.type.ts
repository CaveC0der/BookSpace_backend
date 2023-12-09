import { CommentCreationT } from './comment-creation.type';

export type CommentUpdateT = Required<Omit<CommentCreationT, 'userId' | 'bookId'>>
