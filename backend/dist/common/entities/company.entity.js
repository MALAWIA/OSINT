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
exports.Company = void 0;
const typeorm_1 = require("typeorm");
const sentiment_analysis_entity_1 = require("./sentiment-analysis.entity");
const company_mention_entity_1 = require("./company-mention.entity");
const detected_event_entity_1 = require("./detected-event.entity");
const discussion_channel_entity_1 = require("./discussion-channel.entity");
const stock_price_entity_1 = require("./stock-price.entity");
const corporate_action_entity_1 = require("./corporate-action.entity");
const regulatory_feed_entity_1 = require("./regulatory-feed.entity");
let Company = class Company {
};
exports.Company = Company;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Company.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 10 }),
    __metadata("design:type", String)
], Company.prototype, "ticker", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "sector", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Company.prototype, "listedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Company.prototype, "marketCap", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Company.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Company.prototype, "hasRegulatoryFlag", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Company.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Company.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sentiment_analysis_entity_1.SentimentAnalysis, sentiment => sentiment.company),
    __metadata("design:type", Array)
], Company.prototype, "sentimentAnalysis", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => company_mention_entity_1.CompanyMention, mention => mention.company),
    __metadata("design:type", Array)
], Company.prototype, "mentions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => detected_event_entity_1.DetectedEvent, event => event.company),
    __metadata("design:type", Array)
], Company.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => discussion_channel_entity_1.DiscussionChannel, channel => channel.company),
    __metadata("design:type", Array)
], Company.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_price_entity_1.StockPrice, price => price.company),
    __metadata("design:type", Array)
], Company.prototype, "stockPrices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => corporate_action_entity_1.CorporateAction, action => action.company),
    __metadata("design:type", Array)
], Company.prototype, "corporateActions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => regulatory_feed_entity_1.RegulatoryFeed, feed => feed.company),
    __metadata("design:type", Array)
], Company.prototype, "regulatoryFeeds", void 0);
exports.Company = Company = __decorate([
    (0, typeorm_1.Entity)('companies')
], Company);
//# sourceMappingURL=company.entity.js.map