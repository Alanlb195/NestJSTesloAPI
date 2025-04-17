import { ExecutionContext } from "@nestjs/common";
import { getRawHeadersHandler } from "./get-headers.decorator";

describe('getRawHeadersHandler', () => {

  it('should return the raw headers from the request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          rawHeaders: ['Authorization', 'Bearer Token', 'User-Agent', 'NestJs']
        }),
      }),
    } as unknown as ExecutionContext;

    const result = getRawHeadersHandler(null, mockExecutionContext);

    // console.log(result);
    
    expect(result).toEqual(['Authorization', 'Bearer Token', 'User-Agent', 'NestJs']);
  });

  it('should throw if rawHeaders is missing', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    

    expect(() => getRawHeadersHandler(null, mockExecutionContext)).toThrow('Headers not found (request)');
  });

});
