import { User } from './user.entity';
import { Message } from './message.entity';
export declare class ModerationFlag {
    id: string;
    flaggerId: string;
    moderatorId?: string;
    messageId?: string;
    reason: 'spam' | 'inappropriate' | 'financial_advice' | 'misinformation' | 'harassment' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    moderatorNotes?: string;
    createdAt: Date;
    flagger: User;
    moderator?: User;
    message?: Message;
}
