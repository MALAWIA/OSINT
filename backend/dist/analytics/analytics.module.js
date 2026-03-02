"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const user_entity_1 = require("../common/entities/user.entity");
const message_entity_1 = require("../common/entities/message.entity");
const news_article_entity_1 = require("../common/entities/news-article.entity");
const company_entity_1 = require("../common/entities/company.entity");
const sentiment_analysis_entity_1 = require("../common/entities/sentiment-analysis.entity");
const moderation_flag_entity_1 = require("../common/entities/moderation-flag.entity");
const detected_event_entity_1 = require("../common/entities/detected-event.entity");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                message_entity_1.Message,
                news_article_entity_1.NewsArticle,
                company_entity_1.Company,
                sentiment_analysis_entity_1.SentimentAnalysis,
                moderation_flag_entity_1.ModerationFlag,
                detected_event_entity_1.DetectedEvent,
            ]),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map