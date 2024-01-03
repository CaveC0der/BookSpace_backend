import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { FORBIDDEN_ROLES_KEY, ROLES_KEY } from './roles.decorator';
import { TokenPayloadT } from '../tokens/types/token-payload.type';
import validateArray from '../shared/utils/validate-array';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const forbiddenRoles = this.reflector.getAllAndOverride<Role[] | undefined>(FORBIDDEN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles && !forbiddenRoles) {
      return true;
    }

    const payload: TokenPayloadT | undefined = context.switchToHttp().getRequest().payload;
    if (!payload || !payload.roles.length) {
      throw new ForbiddenException();
    }

    return validateArray(payload.roles, requiredRoles, forbiddenRoles);
  }
}
