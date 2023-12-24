import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../tokens/tokens.service';

@Injectable()
export default class RefreshGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.tokensService.extractRefreshToken(req);

    if (!token)
      throw new UnauthorizedException();

    req.payload = await this.tokensService.verifyToken(token, 'REFRESH');

    if (!req.payload)
      throw new UnauthorizedException();

    req.refreshToken = token;

    return true;
  }
}
