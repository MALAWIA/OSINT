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
exports.DetectedEvent = void 0;
const typeorm_1 = require("typeorm");
const news_article_entity_1 = require("./news-article.entity");
const company_entity_1 = require("./company.entity");
let DetectedEvent = class DetectedEvent {
};
exports.DetectedEvent = DetectedEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DetectedEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], DetectedEvent.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DetectedEvent.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['earnings', 'merger', 'acquisition', 'dividend', 'stock_split', 'management_change', 'regulatory', 'other'],
        default: 'other'
    }),
    __metadata("design:type", String)
], DetectedEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DetectedEvent.prototype, "eventText", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DetectedEvent.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], DetectedEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DetectedEvent.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DetectedEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], DetectedEvent.prototype, "detectedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => news_article_entity_1.NewsArticle, article => article.events),
    __metadata("design:type", news_article_entity_1.NewsArticle)
], DetectedEvent.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.events),
    __metadata("design:type", company_entity_1.Company)
], DetectedEvent.prototype, "company", void 0);
exports.DetectedEvent = DetectedEvent = __decorate([
    (0, typeorm_1.Entity)('detected_events')
], DetectedEvent);
//# sourceMappingURL=detected-event.entity.js.map