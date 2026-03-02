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
exports.NewsSource = void 0;
const typeorm_1 = require("typeorm");
const news_article_entity_1 = require("./news-article.entity");
let NewsSource = class NewsSource {
};
exports.NewsSource = NewsSource;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NewsSource.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 255 }),
    __metadata("design:type", String)
], NewsSource.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 500 }),
    __metadata("design:type", String)
], NewsSource.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['rss', 'api', 'web_scraping'],
        default: 'web_scraping'
    }),
    __metadata("design:type", String)
], NewsSource.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NewsSource.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], NewsSource.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], NewsSource.prototype, "articleCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NewsSource.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_article_entity_1.NewsArticle, article => article.source),
    __metadata("design:type", Array)
], NewsSource.prototype, "articles", void 0);
exports.NewsSource = NewsSource = __decorate([
    (0, typeorm_1.Entity)('news_sources')
], NewsSource);
//# sourceMappingURL=news-source.entity.js.map