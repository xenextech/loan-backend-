import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

// Prisma error codes that reflect a bad request (wrong shape/size/reference),
// not a server fault. Data that reaches this point should have been rejected
// by DTO validation already — this is a safety net so a gap there still
// surfaces as 400/404/409, never a raw 500.
const PRISMA_ERROR_STATUS: Record<string, HttpStatus> = {
  P2000: HttpStatus.BAD_REQUEST, // value too long for the column type
  P2002: HttpStatus.CONFLICT, // unique constraint violation
  P2003: HttpStatus.BAD_REQUEST, // foreign key constraint violation
  P2011: HttpStatus.BAD_REQUEST, // null constraint violation
  P2012: HttpStatus.BAD_REQUEST, // missing required value
  P2020: HttpStatus.BAD_REQUEST, // value out of range for the column type
  P2025: HttpStatus.NOT_FOUND, // record not found
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string | string[]) ?? exception.message;
        error = (res.error as string) ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = PRISMA_ERROR_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;
      error =
        status === HttpStatus.NOT_FOUND
          ? 'NotFound'
          : status === HttpStatus.CONFLICT
            ? 'Conflict'
            : 'BadRequest';
      message =
        status === HttpStatus.NOT_FOUND
          ? 'Record not found'
          : 'Invalid data provided';
      this.logger.error(
        `Prisma error ${exception.code}: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'BadRequest';
      message = 'Invalid data provided';
      this.logger.error(`Prisma validation error: ${exception.message}`);
    } else if (exception instanceof Error) {
      // Full details go to the server log only — never echo raw internal
      // error text (driver messages, stack traces) back to API consumers.
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
