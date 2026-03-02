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
exports.CompanyMention = void 0;
const typeorm_1 = require("typeorm");
const news_article_entity_1 = require("./news-article.entity");
const company_entity_1 = require("./company.entity");
let CompanyMention = class CompanyMention {
};
exports.CompanyMention = CompanyMention;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompanyMention.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CompanyMention.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CompanyMention.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CompanyMention.prototype, "mentionText", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], CompanyMention.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CompanyMention.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CompanyMention.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompanyMention.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => news_article_entity_1.NewsArticle, article => article.mentions),
    __metadata("design:type", news_article_entity_1.NewsArticle)
], CompanyMention.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.mentions),
    __metadata("design:type", company_entity_1.Company)
], CompanyMention.prototype, "company", void 0);
exports.CompanyMention = CompanyMention = __decorate([
    (0, typeorm_1.Entity)('company_mentions')
], CompanyMention);
//# sourceMappingURL=company-mention.entity.js.map