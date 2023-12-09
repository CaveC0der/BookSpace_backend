import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Token = createParamDecorator(
  (data: 'access' | 'refresh' = 'access', ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req[`${data}Token`];
  },
);
