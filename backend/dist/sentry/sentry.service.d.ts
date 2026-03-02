import { OnModuleInit } from '@nestjs/common';
export declare class SentryService implements OnModuleInit {
    onModuleInit(): void;
    captureException(error: Error, context?: any): void;
    captureMessage(message: string, level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'): void;
    addBreadcrumb(breadcrumb: any): void;
    setUser(user: any): void;
    clearUser(): void;
    setTag(key: string, value: string): void;
    setContext(key: string, value: any): void;
}
