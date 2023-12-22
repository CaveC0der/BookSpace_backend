import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../token/token.service';

@Injectable()
export default class RefreshGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.tokenService.extractRefreshToken(req);

    if (!token)
      throw new UnauthorizedException();

    req.payload = await this.tokenService.verifyToken(token, 'REFRESH');

    if (!req.payload)
      throw new UnauthorizedException();

    req.refreshToken = token;

    return true;
  }
}
