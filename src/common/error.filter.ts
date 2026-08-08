import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        errors: exception.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errors: 'Internal Server Error',
      });
    }
  }
}
