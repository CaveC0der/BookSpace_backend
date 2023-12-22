import { SignupRequestT } from './signup-request.type';

export type LoginRequestT = Omit<SignupRequestT, 'username'>
