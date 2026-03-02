import { Company } from './company.entity';
import { User } from './user.entity';
export declare enum RegulatoryFeedStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged"
}
export declare enum RegulatorySource {
    CMA = "cma",
    NSE = "nse",
    CBK = "cbk",
    GOVERNMENT = "government",
    OTHER = "other"
}
export declare class RegulatoryFeed {
    id: string;
    companyId: string;
    title: string;
    content: string;
    summary: string;
    source: RegulatorySource;
    sourceUrl: string;
    status: RegulatoryFeedStatus;
    reviewedById: string;
    reviewNotes: string;
    reviewedAt: Date;
    publishedAt: Date;
    affectedTickers: string[];
    metadata: any;
    isUrgent: boolean;
    createdAt: Date;
    updatedAt: Date;
    company: Company;
    reviewedBy: User;
}
