import { User } from './user.entity';
import { DiscussionChannel } from './discussion-channel.entity';
import { NewsArticle } from './news-article.entity';
import { MessageReaction } from './message-reaction.entity';
export declare class Message {
    id: string;
    channelId: string;
    userId: string;
    content: string;
    articleId?: string;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    channel: DiscussionChannel;
    article?: NewsArticle;
    reactions: MessageReaction[];
}
