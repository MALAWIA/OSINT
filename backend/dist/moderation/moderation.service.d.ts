export declare class ModerationService {
    private flags;
    createFlag(flagData: {
        flaggerId: string;
        messageId?: string;
        reason: 'spam' | 'inappropriate' | 'financial_advice' | 'misinformation' | 'harassment' | 'other';
        description?: string;
    }): Promise<{
        status: string;
        createdAt: string;
        flaggerId: string;
        messageId?: string;
        reason: "spam" | "inappropriate" | "financial_advice" | "misinformation" | "harassment" | "other";
        description?: string;
        id: string;
    }>;
    getPendingFlags(): Promise<any[]>;
    reviewFlag(flagId: string, moderatorId: string, status: 'reviewed' | 'resolved' | 'dismissed', notes?: string): Promise<void>;
    getFlaggedContent(limit?: number): Promise<any[]>;
    getModerationStats(hours?: number): Promise<{
        totalFlags: number;
        pendingFlags: number;
        resolvedFlags: number;
        resolutionRate: number;
    }>;
}
