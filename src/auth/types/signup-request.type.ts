import { UserCreationT } from '../../users/types/user-creation.type';

export type SignupRequestT = Omit<UserCreationT, 'avatar' | 'bio'>
