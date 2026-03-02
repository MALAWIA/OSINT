import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SentryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    // Add request context to Sentry
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${request.method} ${request.url}`,
      level: 'info',
      data: {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        userAgent: request.get('user-agent'),
        ip: request.ip,
      },
    });

    return next.handle().pipe(
      tap(() => {
        // Log successful requests
        const duration = Date.now() - startTime;
        Sentry.addBreadcrumb({
          category: 'http',
          message: `${request.method} ${request.url} - Success`,
          level: 'info',
          data: {
            method: request.method,
            url: request.url,
            duration,
            statusCode: context.switchToHttp().getResponse().statusCode,
          },
        });
      }),
      catchError((error) => {
        // Log errors with context
        const duration = Date.now() - startTime;
        
        Sentry.withScope((scope) => {
          scope.setTag('http.method', request.method);
          scope.setTag('http.url', request.url);
          scope.setTag('http.status_code', error.status || 500);
          scope.setContext('http_request', {
            method: request.method,
            url: request.url,
            headers: this.sanitizeHeaders(request.headers),
            body: this.sanitizeBody(request.body),
            params: request.params,
            query: request.query,
            duration,
          });

          // Capture exception with context
          Sentry.captureException(error);
        });

        this.logger.error(
          `Error in ${request.method} ${request.url}: ${error.message}`,
          error.stack,
        );

        return throwError(() => error);
      }),
    );
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
