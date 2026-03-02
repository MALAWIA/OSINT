"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockPricesModule = void 0;
const common_1 = require("@nestjs/common");
const stock_prices_service_1 = require("./stock-prices.service");
const stock_prices_controller_1 = require("./stock-prices.controller");
let StockPricesModule = class StockPricesModule {
};
exports.StockPricesModule = StockPricesModule;
exports.StockPricesModule = StockPricesModule = __decorate([
    (0, common_1.Module)({
        controllers: [stock_prices_controller_1.StockPricesController],
        providers: [stock_prices_service_1.StockPricesService],
        exports: [stock_prices_service_1.StockPricesService],
    })
], StockPricesModule);
//# sourceMappingURL=stock-prices.module.js.map