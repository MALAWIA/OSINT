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
exports.RegulatoryFeed = exports.RegulatorySource = exports.RegulatoryFeedStatus = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
const user_entity_1 = require("./user.entity");
var RegulatoryFeedStatus;
(function (RegulatoryFeedStatus) {
    RegulatoryFeedStatus["PENDING"] = "pending";
    RegulatoryFeedStatus["APPROVED"] = "approved";
    RegulatoryFeedStatus["REJECTED"] = "rejected";
    RegulatoryFeedStatus["FLAGGED"] = "flagged";
})(RegulatoryFeedStatus || (exports.RegulatoryFeedStatus = RegulatoryFeedStatus = {}));
var RegulatorySource;
(function (RegulatorySource) {
    RegulatorySource["CMA"] = "cma";
    RegulatorySource["NSE"] = "nse";
    RegulatorySource["CBK"] = "cbk";
    RegulatorySource["GOVERNMENT"] = "government";
    RegulatorySource["OTHER"] = "other";
})(RegulatorySource || (exports.RegulatorySource = RegulatorySource = {}));
let RegulatoryFeed = class RegulatoryFeed {
};
exports.RegulatoryFeed = RegulatoryFeed;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RegulatorySource,
        default: RegulatorySource.CMA,
    }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RegulatoryFeedStatus,
        default: RegulatoryFeedStatus.PENDING,
    }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RegulatoryFeed.prototype, "reviewNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RegulatoryFeed.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], RegulatoryFeed.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], RegulatoryFeed.prototype, "affectedTickers", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], RegulatoryFeed.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RegulatoryFeed.prototype, "isUrgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RegulatoryFeed.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RegulatoryFeed.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.regulatoryFeeds),
    __metadata("design:type", company_entity_1.Company)
], RegulatoryFeed.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], RegulatoryFeed.prototype, "reviewedBy", void 0);
exports.RegulatoryFeed = RegulatoryFeed = __decorate([
    (0, typeorm_1.Entity)('regulatory_feeds'),
    (0, typeorm_1.Index)(['companyId', 'publishedAt'])
], RegulatoryFeed);
//# sourceMappingURL=regulatory-feed.entity.js.map