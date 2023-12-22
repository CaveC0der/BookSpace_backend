import { SignupRequestT } from '../src/auth/types/signup-request.type';
import { LoginRequestT } from '../src/auth/types/login-request.type';

export const loginRequestBody: LoginRequestT = {
  email: 'e2e@mail.com',
  password: 'e2e-secret',
};

export const signupRequestBody: SignupRequestT = {
  ...loginRequestBody,
  username: 'User-e2e',
};
