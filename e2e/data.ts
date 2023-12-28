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

export const adminLoginDto: LoginRequestT = {
  email: 'admin-e2e@mail.com',
  password: 'admin-e2e-secret',
};

export const adminSignupDto: SignupRequestT = {
  ...adminLoginDto,
  username: 'Admin-e2e',
};

export const loginDto: LoginRequestT = {
  email: 'e2e@mail.com',
  password: 'e2e-secret',
};

export const signupDto: SignupRequestT = {
  ...loginDto,
  username: 'User-e2e',
};

export const userUpdateDto: UserUpdateT = {
  username: 'UpdatedUser-e2e',
};

export const roleUpdateDto: RoleUpdateT = {
  description: 'True power!',
};

export const genreCreationDto: GenreCreationT = {
  name: 'Sci-Fi',
  description: 'Visions of future...',
};

export const genreUpdateDto: GenreUpdateT = {
  description: 'Tales about future...',
};

export const bookCreationDto: BookCreationDto = {
  name: 'Boring Adventures',
  synopsis: '...',
  genres: ['Sci-Fi'],
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
