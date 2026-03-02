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
exports.PriceAlertsController = void 0;
const common_1 = require("@nestjs/common");
const price_alerts_service_1 = require("./price-alerts.service");
const create_alert_dto_1 = require("./dto/create-alert.dto");
const update_alert_dto_1 = require("./dto/update-alert.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let PriceAlertsController = class PriceAlertsController {
    constructor(priceAlertsService) {
        this.priceAlertsService = priceAlertsService;
    }
    async getUserAlerts(user, status) {
        return this.priceAlertsService.getUserAlerts(user.id || '1', status);
    }
    async getAlertStats(user) {
        return this.priceAlertsService.getAlertStats(user.id || '1');
    }
    async getTriggeredAlerts(user) {
        return this.priceAlertsService.getTriggeredAlerts(user.id || '1');
    }
    async getAlert(id, user) {
        return this.priceAlertsService.getAlertById(id, user.id || '1');
    }
    async createAlert(dto, user) {
        return this.priceAlertsService.createAlert(user.id || '1', dto);
    }
    async updateAlert(id, dto, user) {
        return this.priceAlertsService.updateAlert(id, user.id || '1', dto);
    }
    async disableAlert(id, user) {
        return this.priceAlertsService.disableAlert(id, user.id || '1');
    }
    async deleteAlert(id, user) {
        return this.priceAlertsService.deleteAlert(id, user.id || '1');
    }
};
exports.PriceAlertsController = PriceAlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "getUserAlerts", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "getAlertStats", null);
__decorate([
    (0, common_1.Get)('triggered'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "getTriggeredAlerts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ANALYST, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "getAlert", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_dto_1.CreateAlertDto, Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_alert_dto_1.UpdateAlertDto, Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "updateAlert", null);
__decorate([
    (0, common_1.Put)(':id/disable'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "disableAlert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PORTFOLIO_MANAGER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PriceAlertsController.prototype, "deleteAlert", null);
exports.PriceAlertsController = PriceAlertsController = __decorate([
    (0, common_1.Controller)('alerts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [price_alerts_service_1.PriceAlertsService])
], PriceAlertsController);
//# sourceMappingURL=price-alerts.controller.js.map