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
exports.CorporateAction = exports.CorporateActionType = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
var CorporateActionType;
(function (CorporateActionType) {
    CorporateActionType["DIVIDEND"] = "dividend";
    CorporateActionType["STOCK_SPLIT"] = "stock_split";
    CorporateActionType["RIGHTS_ISSUE"] = "rights_issue";
    CorporateActionType["BONUS_ISSUE"] = "bonus_issue";
    CorporateActionType["AGM"] = "agm";
    CorporateActionType["EGM"] = "egm";
    CorporateActionType["EARNINGS_RELEASE"] = "earnings_release";
    CorporateActionType["LISTING"] = "listing";
    CorporateActionType["DELISTING"] = "delisting";
    CorporateActionType["SUSPENSION"] = "suspension";
    CorporateActionType["OTHER"] = "other";
})(CorporateActionType || (exports.CorporateActionType = CorporateActionType = {}));
let CorporateAction = class CorporateAction {
};
exports.CorporateAction = CorporateAction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CorporateAction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CorporateAction.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CorporateActionType,
        default: CorporateActionType.OTHER,
    }),
    __metadata("design:type", String)
], CorporateAction.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], CorporateAction.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CorporateAction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], CorporateAction.prototype, "actionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CorporateAction.prototype, "recordDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CorporateAction.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CorporateAction.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], CorporateAction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CorporateAction.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CorporateAction.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CorporateAction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, company => company.corporateActions),
    __metadata("design:type", company_entity_1.Company)
], CorporateAction.prototype, "company", void 0);
exports.CorporateAction = CorporateAction = __decorate([
    (0, typeorm_1.Entity)('corporate_actions'),
    (0, typeorm_1.Index)(['companyId', 'actionDate'])
], CorporateAction);
//# sourceMappingURL=corporate-action.entity.js.map