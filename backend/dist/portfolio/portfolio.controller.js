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
exports.PortfolioController = void 0;
const common_1 = require("@nestjs/common");
const portfolio_service_1 = require("./portfolio.service");
const create_portfolio_dto_1 = require("./dto/create-portfolio.dto");
const update_portfolio_dto_1 = require("./dto/update-portfolio.dto");
const add_holding_dto_1 = require("./dto/add-holding.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let PortfolioController = class PortfolioController {
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }
    async getUserPortfolios(user) {
        return this.portfolioService.getUserPortfolios(user.id || '1');
    }
    async getPortfolio(id, user) {
        return this.portfolioService.getPortfolioById(id, user.id || '1');
    }
    async getPortfolioPerformance(id, user) {
        return this.portfolioService.getPortfolioPerformance(id, user.id || '1');
    }
    async createPortfolio(dto, user) {
        return this.portfolioService.createPortfolio(user.id || '1', dto);
    }
    async updatePortfolio(id, dto, user) {
        return this.portfolioService.updatePortfolio(id, user.id || '1', dto);
    }
    async deletePortfolio(id, user) {
        return this.portfolioService.deletePortfolio(id, user.id || '1');
    }
    async addHolding(id, dto, user) {
        return this.portfolioService.addHolding(id, user.id || '1', dto);
    }
    async updateHolding(id, holdingId, dto, user) {
        return this.portfolioService.updateHolding(id, holdingId, user.id || '1', dto);
    }
    async removeHolding(id, holdingId, user) {
        return this.portfolioService.removeHolding(id, holdingId, user.id || '1');
    }
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getUserPortfolios", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)(':id/performance'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getPortfolioPerformance", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_portfolio_dto_1.CreatePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "createPortfolio", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_portfolio_dto_1.UpdatePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "updatePortfolio", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "deletePortfolio", null);
__decorate([
    (0, common_1.Post)(':id/holdings'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_holding_dto_1.AddHoldingDto, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "addHolding", null);
__decorate([
    (0, common_1.Put)(':id/holdings/:holdingId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('holdingId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_holding_dto_1.UpdateHoldingDto, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "updateHolding", null);
__decorate([
    (0, common_1.Delete)(':id/holdings/:holdingId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('holdingId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "removeHolding", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, common_1.Controller)('portfolios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [portfolio_service_1.PortfolioService])
], PortfolioController);
//# sourceMappingURL=portfolio.controller.js.map