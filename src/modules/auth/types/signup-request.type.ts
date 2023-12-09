import { UserCreationT } from '../../user/types/user-creation.type';

export type SignupRequestT = Omit<UserCreationT, 'avatar' | 'bio'>
