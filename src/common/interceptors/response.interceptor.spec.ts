import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  function buildContext(statusCode = 200): ExecutionContext {
    return {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    } as unknown as ExecutionContext;
  }

  function handlerReturning(value: unknown): CallHandler {
    return { handle: () => of(value) } as CallHandler;
  }

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('wraps a plain object payload with success/statusCode/message/timestamp', (done) => {
    interceptor
      .intercept(buildContext(201), handlerReturning({ id: 'app-1' }))
      .subscribe((result) => {
        expect(result).toEqual({
          success: true,
          statusCode: 201,
          message: 'Request successful',
          data: { id: 'app-1' },
          timestamp: expect.stringMatching(ISO_8601) as string,
        });
        done();
      });
  });

  it('wraps a paginated { data, meta } response the same way as any other payload', (done) => {
    const paginated = { data: [{ id: '1' }], meta: { total: 1 } };
    interceptor
      .intercept(buildContext(200), handlerReturning(paginated))
      .subscribe((result) => {
        expect(result).toMatchObject({ success: true, data: paginated });
        expect(result.timestamp).toMatch(ISO_8601);
        done();
      });
  });

  it('wraps primitive (non-object) return values, e.g. a plain string', (done) => {
    interceptor
      .intercept(buildContext(200), handlerReturning('Hello World'))
      .subscribe((result) => {
        expect(result.data).toBe('Hello World');
        expect(result.timestamp).toMatch(ISO_8601);
        done();
      });
  });

  it('passes a pre-formatted envelope through unchanged when it already has a timestamp', (done) => {
    const preFormatted = {
      success: true,
      statusCode: 200,
      message: 'Custom message',
      data: { foo: 'bar' },
      timestamp: '2020-01-01T00:00:00.000Z',
    };
    interceptor
      .intercept(buildContext(200), handlerReturning(preFormatted))
      .subscribe((result) => {
        expect(result).toBe(preFormatted);
        expect(result.timestamp).toBe('2020-01-01T00:00:00.000Z');
        done();
      });
  });

  it('backfills a timestamp on a pre-formatted envelope that is missing one, preserving every other field', (done) => {
    const preFormatted = {
      success: true,
      statusCode: 200,
      message: 'Custom message',
      data: { foo: 'bar' },
    };
    interceptor
      .intercept(buildContext(200), handlerReturning(preFormatted))
      .subscribe((result) => {
        expect(result).toEqual({
          ...preFormatted,
          timestamp: expect.stringMatching(ISO_8601) as string,
        });
        done();
      });
  });
});
