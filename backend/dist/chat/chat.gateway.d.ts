import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { AuthService } from '../auth/auth.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    private authService;
    server: Server;
    constructor(chatService: ChatService, authService: AuthService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinChannel(client: Socket, data: JoinChannelDto): Promise<void>;
    handleLeaveChannel(client: Socket, data: {
        channelId: string;
    }): Promise<void>;
    handleSendMessage(client: Socket, data: CreateMessageDto): Promise<void>;
    handleGetChannels(client: Socket): Promise<void>;
    handleGetChannelMessages(client: Socket, data: {
        channelId: string;
        limit?: number;
        offset?: number;
    }): Promise<void>;
}
