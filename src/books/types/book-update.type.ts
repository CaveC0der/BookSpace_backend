import { BookCreationT } from './book-creation.type';

export type BookUpdateT = Partial<Omit<BookCreationT, 'authorId'>>
