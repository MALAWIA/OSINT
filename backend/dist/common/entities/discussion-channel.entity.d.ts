import { User } from './user.entity';
import { Company } from './company.entity';
import { Message } from './message.entity';
export declare class DiscussionChannel {
    id: string;
    name: string;
    channelType: 'stock' | 'general' | 'sector';
    companyId?: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    creator: User;
    company?: Company;
    messages: Message[];
}
