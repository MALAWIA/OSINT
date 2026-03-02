import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getChannels(): Promise<any[]>;
    getChannel(id: string): Promise<any>;
    createChannel(user: any, createChannelDto: CreateChannelDto): Promise<{
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
    getChannelMessages(channelId: string, limit?: number, offset?: number): Promise<any[]>;
    createMessage(channelId: string, user: any, createMessageDto: CreateMessageDto): Promise<{
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
    deleteMessage(messageId: string, user: any): Promise<{
        success: boolean;
    }>;
    joinChannel(channelId: string, user: any): Promise<{
        success: boolean;
        channel: any;
    }>;
    leaveChannel(channelId: string, user: any): Promise<{
        success: boolean;
    }>;
    getChannelStats(channelId: string): Promise<{
        messageCount: number;
        userCount: number;
        lastMessage: any;
    }>;
}
