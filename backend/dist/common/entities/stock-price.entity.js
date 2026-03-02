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
exports.StockPrice = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
let StockPrice = class StockPrice {
};
exports.StockPrice = StockPrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockPrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockPrice.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockPrice.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockPrice.prototype, "high", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockPrice.prototype, "low", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockPrice.prototype, "close", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", Number)
], StockPrice.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockPrice.prototype, "change", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockPrice.prototype, "changePercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], StockPrice.prototype, "tradedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockPrice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.stockPrices),
    __metadata("design:type", company_entity_1.Company)
], StockPrice.prototype, "company", void 0);
exports.StockPrice = StockPrice = __decorate([
    (0, typeorm_1.Entity)('stock_prices'),
    (0, typeorm_1.Index)(['companyId', 'tradedAt'])
], StockPrice);
//# sourceMappingURL=stock-price.entity.js.map