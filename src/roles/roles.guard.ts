import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { TokenPayloadT } from '../tokens/types/token-payload.type';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const payload: TokenPayloadT = context.switchToHttp().getRequest().payload;
    if (!payload || !payload.roles) {
      throw new ForbiddenException();
    }

    return requiredRoles.some((role) => payload.roles.includes(role));
  }
}
