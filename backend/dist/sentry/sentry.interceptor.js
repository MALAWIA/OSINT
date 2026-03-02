"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SentryInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Sentry = require("@sentry/node");
let SentryInterceptor = SentryInterceptor_1 = class SentryInterceptor {
    constructor() {
        this.logger = new common_1.Logger(SentryInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
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
        return next.handle().pipe((0, operators_1.tap)(() => {
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
        }), (0, operators_1.catchError)((error) => {
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
                Sentry.captureException(error);
            });
            this.logger.error(`Error in ${request.method} ${request.url}: ${error.message}`, error.stack);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    sanitizeBody(body) {
        if (!body)
            return null;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
};
exports.SentryInterceptor = SentryInterceptor;
exports.SentryInterceptor = SentryInterceptor = SentryInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], SentryInterceptor);
//# sourceMappingURL=sentry.interceptor.js.map