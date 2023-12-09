import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadT } from '../types/token-payload.type';

export const TokenPayload = createParamDecorator(
  (data: keyof TokenPayloadT | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload: TokenPayloadT = request.payload;

    return data ? payload[data] : payload;
  },
);
