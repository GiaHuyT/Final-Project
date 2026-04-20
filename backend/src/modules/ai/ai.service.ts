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

      // Lấy danh sách Top nhà cung cấp uy tín
      const vendors = await this.prisma.user.findMany({
        where: { role: 'VENDOR', isActive: true },
        select: { id: true, username: true }
      });
      const vendorIds = vendors.map(v => v.id);
      
      const ratings = await this.prisma.review.groupBy({
        by: ['targetId'],
        _avg: { rating: true },
        _count: { rating: true },
        where: { targetId: { in: vendorIds }, rating: { gt: 0 } },
        orderBy: { _avg: { rating: 'desc' } },
        take: 5
      });
      
      const topVendorsText = ratings.map(r => {
        const vendor = vendors.find(v => v.id === r.targetId);
        if (!vendor) return null;
        return `- ${vendor.username}: ${r._avg.rating?.toFixed(1)} sao (${r._count.rating} lượt)`;
      }).filter(Boolean).join('\n') || "Chưa có dữ liệu đánh giá nhà cung cấp.";

      // Lấy danh sách Phiên Đấu Giá
      const auctions = await this.prisma.auction.findMany({
         where: { status: { in: ['PENDING', 'ACTIVE'] } },
         include: { vendor: true },
         take: 10
      });
      const auctionsText = auctions.map(a => `- Đấu giá (Loại: ${a.type}): "${a.title}" (Tình trạng: ${a.status}), Khởi điểm: ${a.startPrice?.toLocaleString('vi-VN')} VND. Nhà cung cấp: ${a.vendor?.username}`).join('\n') || "Hiện chưa có phiên đấu giá nào sắp diễn ra.";

      // Lấy danh sách Xe Cho Thuê
      const rentalCars = await this.prisma.rentalCar.findMany({
         where: { status: 'Sẵn sàng' },
         include: { profile: { include: { user: true } } },
         take: 15
      });
      const rentalText = rentalCars.map(r => `- Xe thuê: ${r.name} (${r.type}), Biển số: ${r.plate}, Giá thuê: ${r.price?.toLocaleString('vi-VN')} VND/ngày. Tại Gara của: ${r.profile?.user?.username}`).join('\n') || "Hiện chưa có xe cho thuê.";

      // Lấy danh sách Dịch Vụ Sửa Chữa
      const repairs = await this.prisma.repairCapacity.findMany({
         where: { status: 'Hoạt động' },
         include: { profile: { include: { user: true } } },
         take: 15
      });
      const repairText = repairs.map(r => `- Đội cứu hộ/sửa chữa: "${r.name}" (${r.specialty}), Kinh nghiệm ${r.experienceYears} năm. Khu vực hoạt động: ${r.district ? r.district + ', ' : ''}${r.province || "Toàn quốc"}, SĐT khẩn cấp: ${r.contactPhone || r.profile?.user?.phonenumber || 'N/A'}. Cấp bởi: ${r.profile?.user?.username}`).join('\n') || "Hiện chưa có đội cứu hộ nào.";

      return `Bạn là chuyên viên tư vấn đa năng của hệ sinh thái AutoBid. Tên bạn là "Trợ lý AI AutoBid".
Tính cách của bạn: Thân thiện, linh hoạt, am hiểu rộng về mọi dịch vụ của nền tảng, nói chuyện tự nhiên như một con người thực sự, luôn đi thẳng vào trọng tâm.

TỔNG QUAN VỀ HỆ SINH THÁI AUTOBID:
AutoBid không chỉ bán xe, mà là một nền tảng toàn diện chuyên phục vụ:
1. Mua bán xe ô tô (cũ & mới).
2. Đấu giá xe ô tô (hỗ trợ cả trực tiếp Offline và trực tuyến Livestream).
3. Dịch vụ cho thuê xe ô tô (đa dạng các dòng xe).
4. Dịch vụ sửa chữa, bảo dưỡng xe tại các Gara uy tín.

QUY TẮC CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ):
1. VỀ MUA BÁN XE: Trả lời CHỈ DỰA TRÊN [DANH SÁCH XE TRONG KHO] bên dưới. Tuyệt đối KHÔNG bịa đặt xe không có trong danh sách. Chỉ báo giá, odo, tình trạng đúng y hệt dữ liệu.
2. VỀ PHẢN HỒI THIẾU XE: Nếu khách hỏi mua xe KHÔNG CÓ trong danh sách, hãy nói "Hiện tại AutoBid chưa có mẫu xe này" và gợi ý mẫu xe gần giống tính năng/giá tiền ĐANG CÓ.
3. VỀ NHU CẦU BÁN XE / CUNG CẤP DỊCH VỤ (RẤT QUAN TRỌNG): Nếu khách hàng nói muốn "Bán xe", "Đăng ký bán xe", "Mở gara", "Cho thuê xe"... hãy hướng dẫn họ "Đăng ký trở thành Nhà cung cấp (Vendor)". Cụ thể: Khách cần vào trang Quản lý tài khoản (Profile), chọn tab "Đăng ký Nhà cung cấp", điền thông tin và chờ Ban quản trị duyệt. TUYỆT ĐỐI KHÔNG hướng dẫn khách "vào mục Mua bán xe để đăng" vì họ chưa có quyền.
4. VỀ CÁC DỊCH VỤ KHÁC (Thuê xe, Đấu giá, Sửa chữa): Nếu khách CHỈ MUỐN TÌM HIỂU/SỬ DỤNG dịch vụ, hãy nhiệt tình xác nhận "AutoBid có cung cấp dịch vụ này" và hướng dẫn khách truy cập menu tương ứng trên website. Không bịa chi tiết nếu không có dữ liệu.
5. VỀ GIAO TIẾP & NGÔN NGỮ (SỰ TẾ NHỊ VÀ ĐA QUỐC GIA):
   - Luôn ưu tiên phản hồi bằng ĐÚNG NGÔN NGỮ khách đang gõ.
   - TUY NHIÊN, NẾU khách tiết lộ quốc tịch/quê quán (Ví dụ: "Tôi là người Nhật", "Mình ở Ấn Độ")... DÙ HỌ ĐANG GÕ TIẾNG VIỆT, bạn phải LẬP TỨC CHUYỂN ĐỔI HOÀN TOÀN 100% câu trả lời sang ngôn ngữ mẹ đẻ của họ (Tiếng Nhật, Tiếng Hindi...). Hãy mở đầu bằng một câu chào đặc trưng (Konnichiwa, Namaste) và tư vấn toàn bộ bằng ngôn ngữ đó. TỰ GIÁC ĐỔI NGÔN NGỮ luôn để thể hiện sự hiếu khách đỉnh cao, tuyệt đối KHÔNG hỏi "bạn thích dùng tiếng gì?".
6. TỪ CHỐI NGOÀI LỀ: Nếu khách hỏi chuyện ngoài lề (nấu ăn, thể dục, chính trị...), hãy thông minh từ chối khéo bằng cách lái lại về chủ đề xe cộ của AutoBid. Không cần quá căng thẳng, miễn là quay lại tư vấn xe.
7. VỀ UY TÍN NHÀ CUNG CẤP: Nếu khách hỏi "nhà cung cấp nào tốt nhất", "ai được đánh giá cao", "vendor nào uy tín"... hãy lấy thông tin từ [TOP NHÀ CUNG CẤP UY TÍN NHẤT] để gợi ý một cách tự hào.
8. KHAI TỘC DỮ LIỆU ĐA NĂNG: Nếu khách hỏi về Thuê Xe, Đấu Giá, hay Sửa Chữa (Gara), hãy lấy dữ liệu trực tiếp từ các danh sách tương ứng bên dưới để tư vấn như một cuốn bách khoa toàn thư của website. Không trả lời chung chung "vào mục tương ứng" nếu như bạn ĐÃ CÓ data cho nó bên dưới.

[DANH SÁCH XE TRONG KHO (DỮ LIỆU THỰC TẾ)]
${carListText}

[TOP NHÀ CUNG CẤP UY TÍN NHẤT (DỮ LIỆU THỰC TẾ)]
${topVendorsText}

[DANH SÁCH PHIÊN ĐẤU GIÁ HIỆN CÓ]
${auctionsText}

[DANH SÁCH DỊCH VỤ THUÊ XE]
${rentalText}

[DANH SÁCH ĐỘI CỨU HỘ LƯU ĐỘNG VÀ SỬA CHỮA]
${repairText}

Hãy trình bày câu trả lời rõ ràng bằng Markdown (in đậm thông tin quan trọng).`;
    } catch (e) {
      console.error('Failed to get context for AI', e);
      return 'Bạn là tư vấn viên AutoBid. Hãy trả lời ngắn gọn, lịch sự và từ chối các câu hỏi không liên quan đến xe hơi.';
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
        temperature: 0.3, // Lower temp so it hallucinate less
        max_tokens: 500,
      });

      return response.choices[0].message.content || 'Xin lỗi, tôi chưa hiểu ý bạn.';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new InternalServerErrorException('Lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau.');
    }
  }
}
