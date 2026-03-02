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
exports.ModerationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const moderation_service_1 = require("./moderation.service");
const user_entity_1 = require("../common/entities/user.entity");
let ModerationController = class ModerationController {
    constructor(moderationService) {
        this.moderationService = moderationService;
    }
    async createFlag(flagData, user) {
        const flag = await this.moderationService.createFlag({
            ...flagData,
            flaggerId: user.id,
        });
        return { success: true, flag };
    }
    async getPendingFlags(user) {
        if (!user.isModerator && !user.isAdmin) {
            throw new Error('Access denied');
        }
        return this.moderationService.getPendingFlags();
    }
    async reviewFlag(id, reviewData, user) {
        if (!user.isModerator && !user.isAdmin) {
            throw new Error('Access denied');
        }
        await this.moderationService.reviewFlag(id, user.id, reviewData.status, reviewData.notes);
        return { success: true };
    }
    async getFlaggedContent(user) {
        if (!user.isModerator && !user.isAdmin) {
            throw new Error('Access denied');
        }
        return this.moderationService.getFlaggedContent();
    }
    async getModerationStats(user) {
        if (!user.isModerator && !user.isAdmin) {
            throw new Error('Access denied');
        }
        return this.moderationService.getModerationStats();
    }
};
exports.ModerationController = ModerationController;
__decorate([
    (0, common_1.Post)('flag'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "createFlag", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getPendingFlags", null);
__decorate([
    (0, common_1.Put)('review/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "reviewFlag", null);
__decorate([
    (0, common_1.Get)('content'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getFlaggedContent", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getModerationStats", null);
exports.ModerationController = ModerationController = __decorate([
    (0, common_1.Controller)('moderation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [moderation_service_1.ModerationService])
], ModerationController);
//# sourceMappingURL=moderation.controller.js.map