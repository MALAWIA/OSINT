"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
let ChatService = class ChatService {
    constructor() {
        this.messages = [];
        this.channels = [
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
    }
    async createChannel(createChannelDto, userId) {
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
    async getChannels(userId) {
        return this.channels;
    }
    async getChannelById(channelId) {
        return this.channels.find(c => c.id === channelId);
    }
    async joinChannel(channelId, userId) {
        const channel = await this.getChannelById(channelId);
        if (!channel) {
            throw new Error('Channel not found');
        }
        return { success: true, channel };
    }
    async leaveChannel(channelId, userId) {
        const channel = await this.getChannelById(channelId);
        if (!channel) {
            throw new Error('Channel not found');
        }
        return { success: true };
    }
    async createMessage(createMessageDto, userId) {
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
    async getMessages(channelId, limit = 50, offset = 0) {
        return this.messages
            .filter(m => m.channelId === channelId && !m.isDeleted)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .slice(offset, offset + limit);
    }
    async deleteMessage(messageId, userId) {
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
    async getChannelStats(channelId) {
        const channelMessages = this.messages.filter(m => m.channelId === channelId && !m.isDeleted);
        const uniqueUsers = new Set(channelMessages.map(m => m.userId));
        return {
            messageCount: channelMessages.length,
            userCount: uniqueUsers.size,
            lastMessage: channelMessages[channelMessages.length - 1] || null,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
//# sourceMappingURL=chat.service.js.map