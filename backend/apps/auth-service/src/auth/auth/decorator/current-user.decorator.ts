import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as { userId: string; email?: string; isAdmin?:boolean,username:string,isEmailVerified:boolean };
});
