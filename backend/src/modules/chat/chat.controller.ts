import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetUser } from '../../core/decorators/get-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversation')
  async createConversation(
    @GetUser('id') userId: number,
    @Body() data: { participantId: number; productId?: number },
  ) {
    return this.chatService.createConversation(
      [userId, data.participantId],
      data.productId,
    );
  }

  @Get('conversations')
  async getConversations(@GetUser('id') userId: number) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages')
  async getMessages(
    @Query('conversationId') conversationId: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const cid = parseInt(conversationId);
    const s = skip ? parseInt(skip) : 0;
    const t = take ? parseInt(take) : 20;
    return this.chatService.getMessages(cid, s, t);
  }
}
