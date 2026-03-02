import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    client: Socket,
    @MessageBody() data: JoinChannelDto,
  ) {
    try {
      const channel = await this.chatService.joinChannel(data.channelId, client.id);
      client.join(data.channelId);
      client.emit('joinedChannel', channel);
      
      // Notify other users in the channel
      client.to(data.channelId).emit('userJoined', {
        userId: client.id,
        channelId: data.channelId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    try {
      await this.chatService.leaveChannel(data.channelId, client.id);
      client.leave(data.channelId);
      client.emit('leftChannel', { channelId: data.channelId });
      
      // Notify other users in the channel
      client.to(data.channelId).emit('userLeft', {
        userId: client.id,
        channelId: data.channelId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      const message = await this.chatService.createMessage(data, client.id);
      
      // Broadcast message to all users in the channel
      this.server.to(data.channelId).emit('newMessage', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getChannels')
  async handleGetChannels(client: Socket) {
    try {
      const channels = await this.chatService.getChannels();
      client.emit('channels', channels);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getChannelMessages')
  async handleGetChannelMessages(
    client: Socket,
    @MessageBody() data: { channelId: string; limit?: number; offset?: number },
  ) {
    try {
      const messages = await this.chatService.getMessages(
        data.channelId,
        data.limit,
        data.offset,
      );
      client.emit('channelMessages', messages);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
