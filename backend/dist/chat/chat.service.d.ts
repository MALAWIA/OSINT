import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
export declare class ChatService {
    private messages;
    private channels;
    createChannel(createChannelDto: CreateChannelDto, userId: string): Promise<{
        id: string;
        name: string;
        type: string;
        description: string;
        companyId: string;
        createdById: string;
        createdAt: string;
        memberCount: number;
        messageCount: number;
        lastMessage: any;
    }>;
    getChannels(userId?: string): Promise<any[]>;
    getChannelById(channelId: string): Promise<any>;
    joinChannel(channelId: string, userId: string): Promise<{
        success: boolean;
        channel: any;
    }>;
    leaveChannel(channelId: string, userId: string): Promise<{
        success: boolean;
    }>;
    createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<{
        id: string;
        content: string;
        userId: string;
        channelId: string;
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        isEdited: boolean;
        reactions: any[];
        user: {
            id: string;
            username: string;
            displayName: string;
        };
    }>;
    getMessages(channelId: string, limit?: number, offset?: number): Promise<any[]>;
    deleteMessage(messageId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getChannelStats(channelId: string): Promise<{
        messageCount: number;
        userCount: number;
        lastMessage: any;
    }>;
}
