import { ModerationService } from './moderation.service';
import { User } from '../common/entities/user.entity';
export declare class ModerationController {
    private moderationService;
    constructor(moderationService: ModerationService);
    createFlag(flagData: any, user: User): Promise<{
        success: boolean;
        flag: {
            status: string;
            createdAt: string;
            flaggerId: string;
            messageId?: string;
            reason: "spam" | "inappropriate" | "financial_advice" | "misinformation" | "harassment" | "other";
            description?: string;
            id: string;
        };
    }>;
    getPendingFlags(user: User): Promise<any[]>;
    reviewFlag(id: string, reviewData: {
        status: string;
        notes?: string;
    }, user: User): Promise<{
        success: boolean;
    }>;
    getFlaggedContent(user: User): Promise<any[]>;
    getModerationStats(user: User): Promise<{
        totalFlags: number;
        pendingFlags: number;
        resolvedFlags: number;
        resolutionRate: number;
    }>;
}
