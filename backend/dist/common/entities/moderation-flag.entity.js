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
exports.ModerationFlag = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const message_entity_1 = require("./message.entity");
let ModerationFlag = class ModerationFlag {
};
exports.ModerationFlag = ModerationFlag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ModerationFlag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "flaggerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "moderatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['spam', 'inappropriate', 'financial_advice', 'misinformation', 'harassment', 'other'],
        default: 'other'
    }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ModerationFlag.prototype, "moderatorNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ModerationFlag.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.flaggedItems),
    __metadata("design:type", user_entity_1.User)
], ModerationFlag.prototype, "flagger", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.moderatedItems),
    __metadata("design:type", user_entity_1.User)
], ModerationFlag.prototype, "moderator", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message, message => message),
    __metadata("design:type", message_entity_1.Message)
], ModerationFlag.prototype, "message", void 0);
exports.ModerationFlag = ModerationFlag = __decorate([
    (0, typeorm_1.Entity)('moderation_flags')
], ModerationFlag);
//# sourceMappingURL=moderation-flag.entity.js.map