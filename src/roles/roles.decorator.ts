import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

export const ROLES_KEY = 'roles';
export const FORBIDDEN_ROLES_KEY = 'forbidden_roles';

export const Roles = (roles: Role[], forbidden?: Role[]) => applyDecorators(
  SetMetadata(ROLES_KEY, roles),
  SetMetadata(FORBIDDEN_ROLES_KEY, forbidden),
);
