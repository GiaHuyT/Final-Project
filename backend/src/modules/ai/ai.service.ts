import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      console.warn('OPENAI_API_KEY is missing! AI Chat will not work.');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });
  }

  async getChatContext(): Promise<string> {
    try {
      // Get all active cars to feed to the AI
      const cars = await this.prisma.product.findMany({
        where: { status: true },
        select: {
          name: true,
          brand: true,
          price: true,
          year: true,
          condition: true,
          mileage: true,
          engineCapacity: true,
          maxPower: true,
        },
        take: 30, // Limit context size
      });

      const carListText = cars.map((c: any) => 
        `- Hãng: ${c.brand}, Mẫu: ${c.name}, Đời: ${c.year}, Tình trạng: ${c.condition}, Odo: ${c.mileage || '0'}km, Giá: ${c.price?.toLocaleString('vi-VN')} VND, Động cơ: ${c.engineCapacity}, Công suất: ${c.maxPower}`
      ).join('\n');

      return `Bạn là chuyên viên tư vấn mua bán và đấu giá xe hơi chuyên nghiệp của hệ thống AutoBid.
Nhiệm vụ của bạn là hỗ trợ, giải đáp và gợi ý các mẫu xe phù hợp nhất cho người dùng một cách ngắn gọn, súc tích và lịch sự.
LƯU Ý QUAN TRỌNG: Hãy dựa vào danh sách xe đang có sẵn trong kho dưới đây để tư vấn. Nếu khách hỏi xe không có trong danh sách, hãy nói rõ là "hiện chưa có" và gợi ý những mẫu gần giống nhất.

[DANH SÁCH XE TRONG KHO]
${carListText}

Hãy trả lời lịch sự, định dạng dễ nhìn bằng Markdown (có thể in đậm hoặc dùng danh sách).`;
    } catch (e) {
      console.error('Failed to get context for AI', e);
      return 'Bạn là tư vấn viên chuyên nghiệp của hệ thống AutoBid.';
    }
  }

  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
        throw new InternalServerErrorException('Hệ thống chưa thiết lập API Key của OpenAI. Vui lòng thêm OPENAI_API_KEY vào biến môi trường.');
    }
    
    const systemPrompt = await this.getChatContext();
    
    // Inject system prompt at the beginning
    const fullMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || 'Xin lỗi, tôi chưa hiểu ý bạn.';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new InternalServerErrorException('Lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau.');
    }
  }
}
