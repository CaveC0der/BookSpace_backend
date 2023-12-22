import { RoleCreationT } from './role-creation.type';

export type RoleUpdateT = Required<Omit<RoleCreationT, 'name'>>
