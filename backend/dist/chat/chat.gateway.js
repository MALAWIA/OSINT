"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const join_channel_dto_1 = require("./dto/join-channel.dto");
const auth_service_1 = require("../auth/auth.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, authService) {
        this.chatService = chatService;
        this.authService = authService;
    }
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinChannel(client, data) {
        try {
            const channel = await this.chatService.joinChannel(data.channelId, client.id);
            client.join(data.channelId);
            client.emit('joinedChannel', channel);
            client.to(data.channelId).emit('userJoined', {
                userId: client.id,
                channelId: data.channelId,
            });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleLeaveChannel(client, data) {
        try {
            await this.chatService.leaveChannel(data.channelId, client.id);
            client.leave(data.channelId);
            client.emit('leftChannel', { channelId: data.channelId });
            client.to(data.channelId).emit('userLeft', {
                userId: client.id,
                channelId: data.channelId,
            });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleSendMessage(client, data) {
        try {
            const message = await this.chatService.createMessage(data, client.id);
            this.server.to(data.channelId).emit('newMessage', message);
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleGetChannels(client) {
        try {
            const channels = await this.chatService.getChannels();
            client.emit('channels', channels);
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleGetChannelMessages(client, data) {
        try {
            const messages = await this.chatService.getMessages(data.channelId, data.limit, data.offset);
            client.emit('channelMessages', messages);
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        join_channel_dto_1.JoinChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveChannel'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getChannels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetChannels", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getChannelMessages'),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetChannelMessages", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        auth_service_1.AuthService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map