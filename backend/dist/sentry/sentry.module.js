"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryConfigModule = void 0;
const common_1 = require("@nestjs/common");
const MockSentryModule = {
    init: (config) => ({
        module: class MockModule {
        },
        providers: [],
        exports: [],
    }),
};
const MockSentry = {
    init: () => { },
    captureException: () => { },
    captureMessage: () => { },
    addBreadcrumb: () => { },
    setUser: () => { },
    setTag: () => { },
    setContext: () => { },
    withScope: (callback) => callback({}),
};
let SentryConfigModule = class SentryConfigModule {
    onModuleInit() {
        process.on('uncaughtException', (error) => {
            MockSentry.captureException(error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            MockSentry.captureException(reason);
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        if (process.env.SENTRY_USER_ID) {
            MockSentry.setUser({
                id: process.env.SENTRY_USER_ID,
                email: process.env.SENTRY_USER_EMAIL,
            });
        }
        MockSentry.setTag('service', 'nse-backend');
        MockSentry.setTag('environment', process.env.NODE_ENV || 'development');
        console.log('Sentry initialized for backend service (mock mode)');
    }
};
exports.SentryConfigModule = SentryConfigModule;
exports.SentryConfigModule = SentryConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            MockSentryModule.init({
                dsn: process.env.SENTRY_DSN,
                environment: process.env.NODE_ENV || 'development',
                release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
                tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
                    ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
                    : 0.1,
                replaysSessionSampleRate: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE
                    ? parseFloat(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
                    : 0.1,
                replaysOnErrorSampleRate: process.env.SENTRY_REPLAYS_ERROR_SAMPLE_RATE
                    ? parseFloat(process.env.SENTRY_REPLAYS_ERROR_SAMPLE_RATE)
                    : 1.0,
                profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE
                    ? parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE)
                    : 1.0,
                integrations: [],
                beforeSend: (event, hint) => {
                    if (event.exception) {
                        const error = hint.originalException;
                        if (process.env.NODE_ENV === 'production' &&
                            error.message?.includes('health check')) {
                            return null;
                        }
                        if (event.request?.url?.includes('/health') ||
                            event.request?.url?.includes('/metrics')) {
                            return null;
                        }
                    }
                    event.tags = {
                        ...event.tags,
                        service: 'nse-backend',
                        version: process.env.npm_package_version || 'unknown',
                    };
                    event.contexts = {
                        ...event.contexts,
                        app: {
                            name: 'NSE Intelligence Backend',
                            version: process.env.npm_package_version || 'unknown',
                            environment: process.env.NODE_ENV || 'development',
                        },
                    };
                    return event;
                },
                classifyErrors: true,
                debug: process.env.NODE_ENV === 'development',
            }),
        ],
        providers: [],
        exports: [],
    })
], SentryConfigModule);
//# sourceMappingURL=sentry.module.js.map