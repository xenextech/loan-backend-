import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from './global-exception.filter';

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ url: '/api/v1/applications/123' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('formats a NestJS HttpException with status/message/error/timestamp/path', () => {
    filter.catch(new NotFoundException('Application not found'), host);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      error: 'Not Found',
      message: 'Application not found',
      timestamp: expect.stringMatching(ISO_8601) as string,
      path: '/api/v1/applications/123',
    });
  });

  it('surfaces class-validator array messages from a ValidationPipe BadRequestException', () => {
    filter.catch(
      new BadRequestException([
        'email must be an email',
        'fullName should not be empty',
      ]),
      host,
    );

    const [body] = jsonMock.mock.calls[0] as [{ message: string[] }];
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(body.message).toEqual([
      'email must be an email',
      'fullName should not be empty',
    ]);
  });

  it('maps a Prisma P2025 (record not found) error to 404 without leaking the raw driver message', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'No record found',
      {
        code: 'P2025',
        clientVersion: '7.8.0',
      },
    );

    filter.catch(prismaError, host);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'NotFound',
        message: 'Record not found',
        timestamp: expect.stringMatching(ISO_8601) as string,
      }),
    );
  });

  it('maps a Prisma P2002 (unique constraint) error to 409', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.8.0',
      },
    );

    filter.catch(prismaError, host);

    expect(statusMock).toHaveBeenCalledWith(409);
  });

  it('never echoes a raw unhandled Error message back to the client — always 500 + generic message + timestamp', () => {
    filter.catch(
      new Error('database connection string invalid: secret-token'),
      host,
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    const [body] = jsonMock.mock.calls[0] as [{ message: string }];
    expect(body.message).toBe('Internal server error');
    expect(body.message).not.toContain('secret-token');
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.stringMatching(ISO_8601) as string,
        success: false,
      }),
    );
  });
});
