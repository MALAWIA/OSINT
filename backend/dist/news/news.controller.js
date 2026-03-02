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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NewsController = class NewsController {
    constructor(newsService) {
        this.newsService = newsService;
    }
    async findAll(page, limit, companyId, sentiment, search) {
        if (companyId) {
            return this.newsService.findByCompany(companyId, parseInt(limit) || 20);
        }
        if (sentiment) {
            return this.newsService.findBySentiment(sentiment, parseInt(limit) || 20);
        }
        if (search) {
            return this.newsService.search(search, parseInt(limit) || 20);
        }
        return this.newsService.findAll(parseInt(limit) || 20, 0);
    }
    async getLatestNews(limit) {
        return this.newsService.getLatestNews(parseInt(limit) || 10);
    }
    async getNewsStats() {
        return this.newsService.getNewsStats();
    }
    async findOne(id) {
        return this.newsService.findOne(id);
    }
    async getNewsByCompany(companyId, limit) {
        return this.newsService.findByCompany(companyId, parseInt(limit) || 20);
    }
    async getNewsByKeyword(keyword, limit) {
        return this.newsService.findByKeyword(keyword, parseInt(limit) || 20);
    }
    async getNewsBySentiment(sentiment, limit) {
        return this.newsService.findBySentiment(sentiment, parseInt(limit) || 20);
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Query)('sentiment')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getLatestNews", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getNewsStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getNewsByCompany", null);
__decorate([
    (0, common_1.Get)('keyword/:keyword'),
    __param(0, (0, common_1.Param)('keyword')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getNewsByKeyword", null);
__decorate([
    (0, common_1.Get)('sentiment/:sentiment'),
    __param(0, (0, common_1.Param)('sentiment')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getNewsBySentiment", null);
exports.NewsController = NewsController = __decorate([
    (0, common_1.Controller)('news'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map