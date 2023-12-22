import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../../token/token.service';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector,
              private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.tokenService.extractAccessToken(req);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (token)
      req.payload = await this.tokenService.verifyToken(token, 'ACCESS');

    if (!req.payload && !isPublic)
      throw new UnauthorizedException();

    req.accessToken = token;

    return true;
  }
}
