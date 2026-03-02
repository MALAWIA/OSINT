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
exports.StockPricesController = void 0;
const common_1 = require("@nestjs/common");
const stock_prices_service_1 = require("./stock-prices.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StockPricesController = class StockPricesController {
    constructor(stockPricesService) {
        this.stockPricesService = stockPricesService;
    }
    async getLiveTicker() {
        return this.stockPricesService.getLiveTicker();
    }
    async getMarketOverview() {
        return this.stockPricesService.getMarketOverview();
    }
    async getSectorHeatmap() {
        return this.stockPricesService.getSectorHeatmap();
    }
    async getSectorPerformance() {
        return this.stockPricesService.getSectorPerformance();
    }
    async getTopGainers(limit) {
        return this.stockPricesService.getTopGainers(parseInt(limit) || 10);
    }
    async getTopLosers(limit) {
        return this.stockPricesService.getTopLosers(parseInt(limit) || 10);
    }
    async getMostActive(limit) {
        return this.stockPricesService.getMostActive(parseInt(limit) || 10);
    }
    async getBySymbol(ticker) {
        return this.stockPricesService.getTickerBySymbol(ticker);
    }
    async getPriceHistory(ticker, range, interval) {
        return this.stockPricesService.getPriceHistory(ticker, range || '1m', interval || '1d');
    }
    async getByCompanyId(companyId) {
        return this.stockPricesService.getTickerById(companyId);
    }
};
exports.StockPricesController = StockPricesController;
__decorate([
    (0, common_1.Get)('ticker'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getLiveTicker", null);
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getMarketOverview", null);
__decorate([
    (0, common_1.Get)('heatmap'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getSectorHeatmap", null);
__decorate([
    (0, common_1.Get)('sectors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getSectorPerformance", null);
__decorate([
    (0, common_1.Get)('gainers'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getTopGainers", null);
__decorate([
    (0, common_1.Get)('losers'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getTopLosers", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getMostActive", null);
__decorate([
    (0, common_1.Get)('symbol/:ticker'),
    __param(0, (0, common_1.Param)('ticker')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getBySymbol", null);
__decorate([
    (0, common_1.Get)('symbol/:ticker/history'),
    __param(0, (0, common_1.Param)('ticker')),
    __param(1, (0, common_1.Query)('range')),
    __param(2, (0, common_1.Query)('interval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockPricesController.prototype, "getByCompanyId", null);
exports.StockPricesController = StockPricesController = __decorate([
    (0, common_1.Controller)('stock-prices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stock_prices_service_1.StockPricesService])
], StockPricesController);
//# sourceMappingURL=stock-prices.controller.js.map