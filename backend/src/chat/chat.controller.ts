import { Controller, Get, Post, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('channels')
  async getChannels() {
    return this.chatService.getChannels();
  }

  @Get('channels/:id')
  async getChannel(@Param('id') id: string) {
    return this.chatService.getChannelById(id);
  }

  @Post('channels')
  async createChannel(@CurrentUser() user: any, @Body() createChannelDto: CreateChannelDto) {
    return this.chatService.createChannel(createChannelDto, user.id);
  }

  @Get('channels/:id/messages')
  async getChannelMessages(
    @Param('id') channelId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getMessages(channelId, limit, offset);
  }

  @Post('channels/:id/messages')
  async createMessage(
    @Param('id') channelId: string,
    @CurrentUser() user: any,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.createMessage(
      { ...createMessageDto, channelId },
      user.id,
    );
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') messageId: string, @CurrentUser() user: any) {
    return this.chatService.deleteMessage(messageId, user.id);
  }

  @Post('channels/:id/join')
  async joinChannel(@Param('id') channelId: string, @CurrentUser() user: any) {
    return this.chatService.joinChannel(channelId, user.id);
  }

  @Post('channels/:id/leave')
  async leaveChannel(@Param('id') channelId: string, @CurrentUser() user: any) {
    return this.chatService.leaveChannel(channelId, user.id);
  }

  @Get('channels/:id/stats')
  async getChannelStats(@Param('id') channelId: string) {
    return this.chatService.getChannelStats(channelId);
  }
}
