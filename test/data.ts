import { SignupRequestT } from '../src/auth/types/signup-request.type';
import { LoginRequestT } from '../src/auth/types/login-request.type';
import { UserUpdateT } from '../src/users/types/user-update.type';

export const adminLoginRequestBody: LoginRequestT = {
  email: 'admin-e2e@mail.com',
  password: 'admin-e2e-secret',
};

export const adminSignupRequestBody: SignupRequestT = {
  ...adminLoginRequestBody,
  username: 'Admin-e2e',
};

export const loginRequestBody: LoginRequestT = {
  email: 'e2e@mail.com',
  password: 'e2e-secret',
};

export const signupRequestBody: SignupRequestT = {
  ...loginRequestBody,
  username: 'User-e2e',
};

export const userUpdateRequestDto: UserUpdateT = {
  username: 'UpdatedUser-e2e',
};
