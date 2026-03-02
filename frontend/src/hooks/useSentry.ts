'use client';

import { useCallback } from 'react';

// Mock Sentry implementation for development
// In production, this will be replaced with actual Sentry
interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
}

interface SentryBreadcrumb {
  category?: string;
  message?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: any;
}

type SentrySeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export function useSentry() {
  const captureException = useCallback((error: Error, context?: any) => {
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry captureException:', error, context);
      return;
    }

    // In production, this would use actual Sentry
    // For now, we'll just log it
    console.error('Error captured:', error, context);
  }, []);

  const captureMessage = useCallback((message: string, level: SentrySeverityLevel = 'info') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sentry captureMessage [${level}]:`, message);
      return;
    }

    console.log(`Message captured [${level}]:`, message);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: SentryBreadcrumb) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry addBreadcrumb:', breadcrumb);
      return;
    }

    console.log('Breadcrumb added:', breadcrumb);
  }, []);

  const setUser = useCallback((user: SentryUser) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry setUser:', user);
      return;
    }

    console.log('User set:', user);
  }, []);

  const clearUser = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry clearUser');
      return;
    }

    console.log('User cleared');
  }, []);

  return {
    captureException,
    captureMessage,
    addBreadcrumb,
    setUser,
    clearUser,
  };
}
