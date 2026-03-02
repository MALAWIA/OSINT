import { User } from './user.entity';
import { Message } from './message.entity';
export declare class MessageReaction {
    id: string;
    messageId: string;
    userId: string;
    reactionType: string;
    createdAt: Date;
    user: User;
    message: Message;
}
