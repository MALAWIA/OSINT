"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const companies_module_1 = require("./companies/companies.module");
const news_module_1 = require("./news/news.module");
const notifications_module_1 = require("./notifications/notifications.module");
const moderation_module_1 = require("./moderation/moderation.module");
const health_module_1 = require("./common/health/health.module");
const portfolio_module_1 = require("./portfolio/portfolio.module");
const stock_prices_module_1 = require("./stock-prices/stock-prices.module");
const price_alerts_module_1 = require("./price-alerts/price-alerts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            companies_module_1.CompaniesModule,
            news_module_1.NewsModule,
            notifications_module_1.NotificationsModule,
            moderation_module_1.ModerationModule,
            health_module_1.HealthModule,
            portfolio_module_1.PortfolioModule,
            stock_prices_module_1.StockPricesModule,
            price_alerts_module_1.PriceAlertsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map