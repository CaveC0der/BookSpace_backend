import { SignupRequestT } from '../src/auth/types/signup-request.type';
import { LoginRequestT } from '../src/auth/types/login-request.type';
import { UserUpdateT } from '../src/users/types/user-update.type';
import { RoleUpdateT } from '../src/roles/types/role-update.type';
import { GenreCreationT } from '../src/genres/types/genre-creation.type';
import { GenreUpdateT } from '../src/genres/types/genre-update.type';
import BookCreationDto from '../src/books/dtos/book-creation.dto';
import BookUpdateDto from '../src/books/dtos/book-update.dto';
import CommentCreationDto from '../src/comments/dtos/comment-creation.dto';
import { CommentUpdateT } from '../src/comments/types/comment-update.type';
import ReviewCreationDto from '../src/reviews/dtos/review-creation.dto';
import { ReviewUpdateT } from '../src/reviews/types/review-update.type';
import { readFileSync } from 'fs';
import { join } from 'path';

export const adminLoginDto: LoginRequestT = {
  email: 'admin-e2e@mail.com',
  password: 'admin-e2e-secret',
};

export const adminSignupDto: SignupRequestT = {
  ...adminLoginDto,
  username: 'Admin-e2e',
};

export const authorLoginDto: LoginRequestT = {
  email: 'author-e2e@mail.com',
  password: 'author-e2e-secret',
};

export const authorSignupDto: SignupRequestT = {
  ...authorLoginDto,
  username: 'Author-e2e',
};

export const author2LoginDto: LoginRequestT = {
  email: 'author-2-e2e@mail.com',
  password: 'author-2-e2e-secret',
};

export const author2SignupDto: SignupRequestT = {
  ...author2LoginDto,
  username: 'Author-2-e2e',
};

export const loginDto: LoginRequestT = {
  email: 'e2e@mail.com',
  password: 'e2e-secret',
};

export const signupDto: SignupRequestT = {
  ...loginDto,
  username: 'User-e2e',
};

export const restrictedLoginDto: LoginRequestT = {
  email: 'restricted-e2e@mail.com',
  password: 'restricted-e2e-secret',
};

export const restrictedSignupDto: SignupRequestT = {
  ...restrictedLoginDto,
  username: 'Restricted-e2e',
};

export const userUpdateDto: UserUpdateT = {
  username: 'UpdatedUser-e2e',
};

export const roleUpdateDto: RoleUpdateT = {
  description: 'True power!',
};

export const genreCreationDto: GenreCreationT = {
  name: 'Genre-e2e',
  description: 'Visions of future...',
};

export const genreUpdateDto: GenreUpdateT = {
  description: 'Tales about future...',
};

export const genre2CreationDto: GenreCreationT = {
  name: 'Genre-2-e2e',
  description: 'Visions of future... part 2',
};

export const bookCreationDto: BookCreationDto = {
  name: 'Boring Adventures',
  synopsis: '...',
  genres: [genreCreationDto.name],
};

export const book2CreationDto: BookCreationDto = {
  name: 'Boring Adventures 2',
  synopsis: '...',
  genres: [genre2CreationDto.name],
};

export const book3CreationDto: BookCreationDto = {
  name: 'Boring Adventures 3',
  synopsis: '...',
  genres: [genreCreationDto.name],
};

export const bookUpdateDto: BookUpdateDto = {
  synopsis: '...nothing',
};

export const commentCreationDto: CommentCreationDto = {
  bookId: 0,
  text: 'Quite good...',
};

export const commentUpdateDto: CommentUpdateT = {
  text: 'More than good...',
};

export const reviewCreationDto: ReviewCreationDto = {
  bookId: 0,
  rate: 5,
};

export const reviewUpdateDto: ReviewUpdateT = {
  rate: 4,
};

export const img = {
  fieldname: 'img',
  originalname: 'test-img.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: readFileSync(join(__dirname, '../static/test-img.jpg')),
  size: 798,
} as Express.Multer.File;
