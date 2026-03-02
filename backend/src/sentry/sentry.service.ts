import { Injectable, OnModuleInit } from '@nestjs/common';

// Mock Sentry service for development
@Injectable()
export class SentryService implements OnModuleInit {
  onModuleInit() {
    console.log('Sentry service initialized (mock mode)');
  }

  captureException(error: Error, context?: any) {
    console.error('Sentry captureException:', error, context);
  }

  captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') {
    console.log(`Sentry captureMessage [${level}]:`, message);
  }

  addBreadcrumb(breadcrumb: any) {
    console.log('Sentry addBreadcrumb:', breadcrumb);
  }

  setUser(user: any) {
    console.log('Sentry setUser:', user);
  }

  clearUser() {
    console.log('Sentry clearUser');
  }

  setTag(key: string, value: string) {
    console.log(`Sentry setTag: ${key} = ${value}`);
  }

  setContext(key: string, value: any) {
    console.log(`Sentry setContext: ${key} =`, value);
  }
}
