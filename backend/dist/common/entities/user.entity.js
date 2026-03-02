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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const message_reaction_entity_1 = require("./message-reaction.entity");
const moderation_flag_entity_1 = require("./moderation-flag.entity");
const notification_entity_1 = require("./notification.entity");
const user_preference_entity_1 = require("./user-preference.entity");
const audit_log_entity_1 = require("./audit-log.entity");
const discussion_channel_entity_1 = require("./discussion-channel.entity");
const portfolio_entity_1 = require("./portfolio.entity");
const price_alert_entity_1 = require("./price-alert.entity");
const user_role_enum_1 = require("../enums/user-role.enum");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_role_enum_1.UserRole,
        default: user_role_enum_1.UserRole.VIEWER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isModerator", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "reputationScore", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], User.prototype, "lastActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, message => message.user),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_reaction_entity_1.MessageReaction, reaction => reaction.user),
    __metadata("design:type", Array)
], User.prototype, "reactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => moderation_flag_entity_1.ModerationFlag, flag => flag.flagger),
    __metadata("design:type", Array)
], User.prototype, "flaggedItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => moderation_flag_entity_1.ModerationFlag, flag => flag.moderator),
    __metadata("design:type", Array)
], User.prototype, "moderatedItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, notification => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_preference_entity_1.UserPreference, preference => preference.user),
    __metadata("design:type", Array)
], User.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_log_entity_1.AuditLog, audit => audit.user),
    __metadata("design:type", Array)
], User.prototype, "auditLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => discussion_channel_entity_1.DiscussionChannel, channel => channel.creator),
    __metadata("design:type", Array)
], User.prototype, "createdChannels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => portfolio_entity_1.Portfolio, portfolio => portfolio.user),
    __metadata("design:type", Array)
], User.prototype, "portfolios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => price_alert_entity_1.PriceAlert, alert => alert.user),
    __metadata("design:type", Array)
], User.prototype, "priceAlerts", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map