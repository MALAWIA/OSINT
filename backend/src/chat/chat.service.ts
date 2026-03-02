import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChatService {
  private messages: any[] = [];
  private channels: any[] = [
    {
      id: '1',
      name: 'General Discussion',
      type: 'general',
      description: 'General NSE discussion',
      companyId: null,
      createdById: '1',
      createdAt: new Date().toISOString(),
      memberCount: 0,
      messageCount: 0,
      lastMessage: null,
    },
    {
      id: '2',
      name: 'Safaricom',
      type: 'stock',
      description: 'Safaricom PLC discussion',
      companyId: '1',
      createdById: '1',
      createdAt: new Date().toISOString(),
      memberCount: 0,
      messageCount: 0,
      lastMessage: null,
    },
  ];

  async createChannel(createChannelDto: CreateChannelDto, userId: string) {
    const channel = {
      id: String(this.channels.length + 1),
      name: createChannelDto.name,
      type: createChannelDto.channelType || 'general',
      description: createChannelDto.description,
      companyId: createChannelDto.companyId || null,
      createdById: userId,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      messageCount: 0,
      lastMessage: null,
    };
    
    this.channels.push(channel);
    return channel;
  }

  async getChannels(userId?: string) {
    return this.channels;
  }

  async getChannelById(channelId: string) {
    return this.channels.find(c => c.id === channelId);
  }

  async joinChannel(channelId: string, userId: string) {
    const channel = await this.getChannelById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    // In a real implementation, this would add user to channel members
    return { success: true, channel };
  }

  async leaveChannel(channelId: string, userId: string) {
    const channel = await this.getChannelById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    // In a real implementation, this would remove user from channel members
    return { success: true };
  }

  async createMessage(createMessageDto: CreateMessageDto, userId: string) {
    const message = {
      id: String(this.messages.length + 1),
      content: createMessageDto.content,
      userId: userId,
      channelId: createMessageDto.channelId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isEdited: false,
      reactions: [],
      user: {
        id: userId,
        username: 'testuser',
        displayName: 'Test User',
      },
    };
    
    this.messages.push(message);
    return message;
  }

  async getMessages(channelId: string, limit = 50, offset = 0) {
    return this.messages
      .filter(m => m.channelId === channelId && !m.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.userId !== userId) {
      throw new Error('Not authorized to delete this message');
    }
    
    message.isDeleted = true;
    return { success: true };
  }

  async getChannelStats(channelId: string) {
    const channelMessages = this.messages.filter(m => m.channelId === channelId && !m.isDeleted);
    const uniqueUsers = new Set(channelMessages.map(m => m.userId));
    
    return {
      messageCount: channelMessages.length,
      userCount: uniqueUsers.size,
      lastMessage: channelMessages[channelMessages.length - 1] || null,
    };
  }
}
