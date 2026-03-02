import { Company } from './company.entity';
export declare enum CorporateActionType {
    DIVIDEND = "dividend",
    STOCK_SPLIT = "stock_split",
    RIGHTS_ISSUE = "rights_issue",
    BONUS_ISSUE = "bonus_issue",
    AGM = "agm",
    EGM = "egm",
    EARNINGS_RELEASE = "earnings_release",
    LISTING = "listing",
    DELISTING = "delisting",
    SUSPENSION = "suspension",
    OTHER = "other"
}
export declare class CorporateAction {
    id: string;
    companyId: string;
    actionType: CorporateActionType;
    title: string;
    description: string;
    actionDate: Date;
    recordDate: Date;
    paymentDate: Date;
    value: number;
    metadata: any;
    isVerified: boolean;
    sourceUrl: string;
    createdAt: Date;
    company: Company;
}
