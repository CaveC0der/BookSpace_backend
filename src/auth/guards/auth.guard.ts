import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { TokensService } from '../../tokens/tokens.service';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector,
              private tokensService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.tokensService.extractAccessToken(req);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (token) {
      req.payload = await this.tokensService.verifyToken(token, 'ACCESS');
    }
    if (!req.payload && !isPublic) {
      throw new UnauthorizedException();
    }

    req.accessToken = token;
    return true;
  }
}
