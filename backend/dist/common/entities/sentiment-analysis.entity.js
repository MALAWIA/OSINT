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
exports.SentimentAnalysis = void 0;
const typeorm_1 = require("typeorm");
const news_article_entity_1 = require("./news-article.entity");
const company_entity_1 = require("./company.entity");
let SentimentAnalysis = class SentimentAnalysis {
};
exports.SentimentAnalysis = SentimentAnalysis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SentimentAnalysis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SentimentAnalysis.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SentimentAnalysis.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], SentimentAnalysis.prototype, "sentimentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
    }),
    __metadata("design:type", String)
], SentimentAnalysis.prototype, "sentimentLabel", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SentimentAnalysis.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], SentimentAnalysis.prototype, "entities", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], SentimentAnalysis.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SentimentAnalysis.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => news_article_entity_1.NewsArticle, article => article.sentimentAnalysis),
    __metadata("design:type", news_article_entity_1.NewsArticle)
], SentimentAnalysis.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.sentimentAnalysis),
    __metadata("design:type", company_entity_1.Company)
], SentimentAnalysis.prototype, "company", void 0);
exports.SentimentAnalysis = SentimentAnalysis = __decorate([
    (0, typeorm_1.Entity)('sentiment_analysis')
], SentimentAnalysis);
//# sourceMappingURL=sentiment-analysis.entity.js.map