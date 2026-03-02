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
exports.PortfolioHolding = void 0;
const typeorm_1 = require("typeorm");
const portfolio_entity_1 = require("./portfolio.entity");
const company_entity_1 = require("./company.entity");
let PortfolioHolding = class PortfolioHolding {
};
exports.PortfolioHolding = PortfolioHolding;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortfolioHolding.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PortfolioHolding.prototype, "portfolioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PortfolioHolding.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "averageBuyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "currentPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "profitLoss", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PortfolioHolding.prototype, "profitLossPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PortfolioHolding.prototype, "lastPriceUpdate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortfolioHolding.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PortfolioHolding.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => portfolio_entity_1.Portfolio, portfolio => portfolio.holdings),
    __metadata("design:type", portfolio_entity_1.Portfolio)
], PortfolioHolding.prototype, "portfolio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    __metadata("design:type", company_entity_1.Company)
], PortfolioHolding.prototype, "company", void 0);
exports.PortfolioHolding = PortfolioHolding = __decorate([
    (0, typeorm_1.Entity)('portfolio_holdings'),
    (0, typeorm_1.Index)(['portfolioId', 'companyId'], { unique: true })
], PortfolioHolding);
//# sourceMappingURL=portfolio-holding.entity.js.map