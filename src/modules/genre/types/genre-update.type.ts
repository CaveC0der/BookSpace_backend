import { GenreCreationT } from './genre-creation.type';

export type GenreUpdateT = Required<Omit<GenreCreationT, 'name'>>
