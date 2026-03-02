"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsArticle = void 0;
const typeorm_1 = require("typeorm");
const news_source_entity_1 = require("./news-source.entity");
const company_mention_entity_1 = require("./company-mention.entity");
const sentiment_analysis_entity_1 = require("./sentiment-analysis.entity");
const detected_event_entity_1 = require("./detected-event.entity");
const message_entity_1 = require("./message.entity");
let NewsArticle = class NewsArticle {
};
exports.NewsArticle = NewsArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NewsArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => news_source_entity_1.NewsSource, source => source.articles),
    __metadata("design:type", news_source_entity_1.NewsSource)
], NewsArticle.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], NewsArticle.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000, unique: true }),
    __metadata("design:type", String)
], NewsArticle.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], NewsArticle.prototype, "rawText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], NewsArticle.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NewsArticle.prototype, "fetchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], NewsArticle.prototype, "contentHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NewsArticle.prototype, "isProcessed", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => company_mention_entity_1.CompanyMention, mention => mention.article),
    __metadata("design:type", Array)
], NewsArticle.prototype, "mentions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sentiment_analysis_entity_1.SentimentAnalysis, sentiment => sentiment.article),
    __metadata("design:type", Array)
], NewsArticle.prototype, "sentimentAnalysis", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => detected_event_entity_1.DetectedEvent, event => event.article),
    __metadata("design:type", Array)
], NewsArticle.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, message => message.article),
    __metadata("design:type", Array)
], NewsArticle.prototype, "messages", void 0);
exports.NewsArticle = NewsArticle = __decorate([
    (0, typeorm_1.Entity)('news_articles')
], NewsArticle);
//# sourceMappingURL=news-article.entity.js.map