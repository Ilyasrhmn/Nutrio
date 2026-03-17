import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    
    // Fallback if httpAdapter is not available
    if (!httpAdapter) {
      this.logger.error('HttpAdapter is not available', exception);
      return;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Safely get request URL
    let path = '/';
    try {
      path = httpAdapter.getRequestUrl(request);
    } catch (e) {
      path = request?.url || '/';
    }

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
      message: typeof message === 'object' ? (message as any).message || (message as any).error : message,
      errors: typeof message === 'object' && Array.isArray((message as any).message) ? (message as any).message : undefined,
    };

    if (responseBody.errors) {
      responseBody.message = 'Validation failed';
    }

    if (httpStatus >= 500) {
      this.logger.error(`Exception: ${JSON.stringify(exception)}`);
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
