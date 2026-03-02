"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryService = void 0;
const common_1 = require("@nestjs/common");
let SentryService = class SentryService {
    onModuleInit() {
        console.log('Sentry service initialized (mock mode)');
    }
    captureException(error, context) {
        console.error('Sentry captureException:', error, context);
    }
    captureMessage(message, level = 'info') {
        console.log(`Sentry captureMessage [${level}]:`, message);
    }
    addBreadcrumb(breadcrumb) {
        console.log('Sentry addBreadcrumb:', breadcrumb);
    }
    setUser(user) {
        console.log('Sentry setUser:', user);
    }
    clearUser() {
        console.log('Sentry clearUser');
    }
    setTag(key, value) {
        console.log(`Sentry setTag: ${key} = ${value}`);
    }
    setContext(key, value) {
        console.log(`Sentry setContext: ${key} =`, value);
    }
};
exports.SentryService = SentryService;
exports.SentryService = SentryService = __decorate([
    (0, common_1.Injectable)()
], SentryService);
//# sourceMappingURL=sentry.service.js.map