import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI Assistant' })
  async chat(@Body() body: { messages: { role: 'system' | 'user' | 'assistant'; content: string }[] }) {
    if (!body.messages || !Array.isArray(body.messages)) {
      return { answer: 'Dữ liệu không hợp lệ.' };
    }
    const answer = await this.aiService.chat(body.messages);
    return { answer };
  }
}
