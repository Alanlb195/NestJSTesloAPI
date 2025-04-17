import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const getRawHeadersHandler = (data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.rawHeaders;

  if (!headers)
    throw new InternalServerErrorException('Headers not found (request)');

  return headers;
};

export const GetRawHeaders = createParamDecorator(getRawHeadersHandler);
