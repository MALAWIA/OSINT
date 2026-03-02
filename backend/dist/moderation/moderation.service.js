"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
let ModerationService = class ModerationService {
    constructor() {
        this.flags = [];
    }
    async createFlag(flagData) {
        const flag = {
            id: String(this.flags.length + 1),
            ...flagData,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        this.flags.push(flag);
        return flag;
    }
    async getPendingFlags() {
        return this.flags
            .filter(f => f.status === 'pending')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async reviewFlag(flagId, moderatorId, status, notes) {
        const flag = this.flags.find(f => f.id === flagId);
        if (flag) {
            flag.moderatorId = moderatorId;
            flag.status = status;
            flag.moderatorNotes = notes;
            flag.reviewedAt = new Date().toISOString();
        }
    }
    async getFlaggedContent(limit = 50) {
        return this.flags
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }
    async getModerationStats(hours = 24) {
        const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
        const recentFlags = this.flags.filter(f => new Date(f.createdAt) >= timeThreshold);
        const totalFlags = recentFlags.length;
        const pendingFlags = recentFlags.filter(f => f.status === 'pending').length;
        const resolvedFlags = recentFlags.filter(f => f.status === 'resolved').length;
        return {
            totalFlags,
            pendingFlags,
            resolvedFlags,
            resolutionRate: totalFlags > 0 ? (resolvedFlags / totalFlags) * 100 : 0,
        };
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = __decorate([
    (0, common_1.Injectable)()
], ModerationService);
//# sourceMappingURL=moderation.service.js.map