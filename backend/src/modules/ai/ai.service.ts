import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

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
        where: { roles: { has: 'VENDOR' }, isActive: true },
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
3. Dịch vụ sửa chữa, bảo dưỡng xe tại các Gara uy tín.

QUY TẮC CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ):
1. VỀ MUA BÁN XE: Trả lời CHỈ DỰA TRÊN [DANH SÁCH XE TRONG KHO] bên dưới. Tuyệt đối KHÔNG bịa đặt xe không có trong danh sách. Chỉ báo giá, odo, tình trạng đúng y hệt dữ liệu.
2. VỀ PHẢN HỒI THIẾU XE: Nếu khách hỏi mua xe KHÔNG CÓ trong danh sách, hãy nói "Hiện tại AutoBid chưa có mẫu xe này" và gợi ý mẫu xe gần giống tính năng/giá tiền ĐANG CÓ.
3. VỀ NHU CẦU BÁN XE / CUNG CẤP DỊCH VỤ (RẤT QUAN TRỌNG): Nếu khách hàng nói muốn "Bán xe", "Đăng ký bán xe", "Mở gara"... hãy hướng dẫn họ "Đăng ký trở thành Nhà cung cấp (Vendor)". Cụ thể: Khách cần vào trang Quản lý tài khoản (Profile), chọn tab "Đăng ký Nhà cung cấp", điền thông tin và chờ Ban quản trị duyệt. TUYỆT ĐỐI KHÔNG hướng dẫn khách "vào mục Mua bán xe để đăng" vì họ chưa có quyền.
4. VỀ CÁC DỊCH VỤ KHÁC (Đấu giá, Sửa chữa): Nếu khách CHỈ MUỐN TÌM HIỂU/SỬ DỤNG dịch vụ, hãy nhiệt tình xác nhận "AutoBid có cung cấp dịch vụ này" và hướng dẫn khách truy cập menu tương ứng trên website. Không bịa chi tiết nếu không có dữ liệu.
5. VỀ GIAO TIẾP & NGÔN NGỮ (SỰ TẾ NHỊ VÀ ĐA QUỐC GIA):
   - Luôn ưu tiên phản hồi bằng ĐÚNG NGÔN NGỮ khách đang gõ.
   - TUY NHIÊN, NẾU khách tiết lộ quốc tịch/quê quán (Ví dụ: "Tôi là người Nhật", "Mình ở Ấn Độ")... DÙ HỌ ĐANG GÕ TIẾNG VIỆT, bạn phải LẬP TỨC CHUYỂN ĐỔI HOÀN TOÀN 100% câu trả lời sang ngôn ngữ mẹ đẻ của họ (Tiếng Nhật, Tiếng Hindi...). Hãy mở đầu bằng một câu chào đặc trưng (Konnichiwa, Namaste) và tư vấn toàn bộ bằng ngôn ngữ đó. TỰ GIÁC ĐỔI NGÔN NGỮ luôn để thể hiện sự hiếu khách đỉnh cao, tuyệt đối KHÔNG hỏi "bạn thích dùng tiếng gì?".
6. TỪ CHỐI NGOÀI LỀ: Nếu khách hỏi chuyện ngoài lề (nấu ăn, thể dục, chính trị...), hãy thông minh từ chối khéo bằng cách lái lại về chủ đề xe cộ của AutoBid. Không cần quá căng thẳng, miễn là quay lại tư vấn xe.
7. VỀ UY TÍN NHÀ CUNG CẤP: Nếu khách hỏi "nhà cung cấp nào tốt nhất", "ai được đánh giá cao", "vendor nào uy tín"... hãy lấy thông tin từ [TOP NHÀ CUNG CẤP UY TÍN NHẤT] để gợi ý một cách tự hào.
8. KHAI TỘC DỮ LIỆU ĐA NĂNG: Nếu khách hỏi về Đấu Giá, hay Sửa Chữa (Gara), hãy lấy dữ liệu trực tiếp từ các danh sách tương ứng bên dưới để tư vấn như một cuốn bách khoa toàn thư của website. Không trả lời chung chung "vào mục tương ứng" nếu như bạn ĐÃ CÓ data cho nó bên dưới.

[DANH SÁCH XE TRONG KHO (DỮ LIỆU THỰC TẾ)]
${carListText}

[TOP NHÀ CUNG CẤP UY TÍN NHẤT (DỮ LIỆU THỰC TẾ)]
${topVendorsText}

[DANH SÁCH PHIÊN ĐẤU GIÁ HIỆN CÓ]
${auctionsText}

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

  async verifyDocumentImage(imageUrl: string, documentType: string): Promise<{ isValid: boolean; reason?: string }> {
    try {
      if (!imageUrl) return { isValid: false, reason: 'Không có đường dẫn ảnh.' };

      // Trích xuất tên file từ URL (vd: http://localhost:3000/uploads/avatars/xxx.png -> xxx.png)
      const filename = imageUrl.split('/').pop();
      if (!filename) return { isValid: false, reason: 'Đường dẫn ảnh không hợp lệ.' };

      // Đường dẫn tuyệt đối tới file cục bộ
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', filename);

      if (!fs.existsSync(filePath)) {
        console.error(`File không tồn tại: ${filePath}`);
        return { isValid: false, reason: 'File ảnh không tồn tại trên máy chủ.' };
      }

      // Đọc file và chuyển sang Base64
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');
      const ext = path.extname(filename).toLowerCase().replace('.', '');
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'gif') mimeType = 'image/gif';

      const dataUri = `data:${mimeType};base64,${base64Image}`;

      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) return { isValid: true }; // Bỏ qua nếu không có API key (phòng ngừa sập hệ thống khi chưa set key)

      let specificRule = '';
      switch (documentType) {
        case 'Ảnh chân dung':
          specificRule = 'YÊU CẦU: Phải là ảnh chụp có khuôn mặt người (selfie/ảnh thẻ). CHÚ Ý: Cứ có mặt người rõ nét là ĐẠT (VALID).';
          break;
        case 'Căn cước công dân (Mặt trước)':
          specificRule = 'YÊU CẦU: Phải là MẶT TRƯỚC của thẻ Căn cước công dân / CMND. \n- ĐẶC ĐIỂM BẮT BUỘC: Phải có ẢNH CHÂN DUNG nhỏ in trên thẻ và Quốc huy (ngôi sao vàng).\n- Nếu KHÔNG CÓ ảnh chân dung nhỏ in trên thẻ (ví dụ thẻ chỉ có vân tay/mã vạch/chip ở phía sau) thì đó KHÔNG PHẢI MẶT TRƯỚC -> INVALID.\n- TUYỆT ĐỐI KHÔNG BÁO LỖI THIẾU CHIP HAY VÂN TAY Ở ĐÂY, VÌ MẶT TRƯỚC KHÔNG CÓ NHỮNG THỨ ĐÓ.';
          break;
        case 'Căn cước công dân (Mặt sau)':
          specificRule = 'YÊU CẦU: Phải là MẶT SAU của thẻ Căn cước công dân / CMND. \n- ĐẶC ĐIỂM BẮT BUỘC: Thường có DẤU VÂN TAY, MÃ MRZ (dòng chữ số ở dưới cùng), hoặc CHIP ĐIỆN TỬ, hoặc MÃ VẠCH. \n- TUYỆT ĐỐI KHÔNG CÓ ảnh chân dung của người trên mặt này.\n- NẾU THẤY VÂN TAY HOẶC MÃ MRZ -> ĐÓ CHẮC CHẮN LÀ MẶT SAU -> VALID.';
          break;
        case 'Giấy phép lái xe (Mặt trước)':
          specificRule = 'YÊU CẦU: Phải là MẶT TRƯỚC của Giấy phép lái xe.\n- ĐẶC ĐIỂM BẮT BUỘC: Có dòng chữ "GIẤY PHÉP LÁI XE" / "DRIVER\'S LICENSE" và CÓ ẢNH CHÂN DUNG in trên thẻ.\n- Nếu không có ảnh chân dung in trên thẻ -> INVALID.';
          break;
        case 'Giấy phép lái xe (Mặt sau)':
          specificRule = 'YÊU CẦU: Phải là MẶT SAU của Giấy phép lái xe.\n- ĐẶC ĐIỂM BẮT BUỘC: KHÔNG CÓ ảnh chân dung. Thường có dòng chữ "CÁC LOẠI XE CƠ GIỚI ĐƯỜNG BỘ ĐƯỢC ĐIỀU KHIỂN" hoặc các bảng/chữ liệt kê hạng xe, có thể có mã QR ở góc.\n- NẾU THẤY CHỮ VỀ CÁC LOẠI XE HOẶC MÃ QR -> ĐÓ CHẮC CHẮN LÀ MẶT SAU -> VALID.';
          break;
        case 'Lý lịch tư pháp (Giấy chứng nhận tiền án tiền sự)':
          specificRule = 'YÊU CẦU: Phải là tờ PHIẾU LÝ LỊCH TƯ PHÁP do cơ quan thẩm quyền cấp.';
          break;
        default:
          specificRule = `YÊU CẦU: Ảnh phải là loại giấy tờ: ${documentType}.`;
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là một chuyên gia kiểm duyệt hình ảnh tải lên. Nhiệm vụ của bạn là kiểm tra xem ảnh có ĐÚNG với loại giấy tờ được yêu cầu hay không.

LOẠI GIẤY TỜ ĐANG YÊU CẦU: "${documentType}"
QUY TẮC KIỂM DUYỆT CHO LOẠI NÀY:
${specificRule}

CHÚ Ý QUAN TRỌNG:
- Chấp nhận ảnh "VALID" kể cả khi xoay ngang, mờ, lộn ngược MIỄN LÀ nhận diện đúng yêu cầu.
- Nếu ảnh hoàn toàn không giống với yêu cầu (ví dụ yêu cầu mặt trước mà tải mặt sau, yêu cầu giấy tờ mà tải ảnh phong cảnh/selfie), hãy TỪ CHỐI.

CÁCH TRẢ LỜI (BẮT BUỘC THỰC HIỆN ĐÚNG):
- NẾU HỢP LỆ: Chỉ trả lời ĐÚNG 1 TỪ duy nhất là "VALID".
- NẾU KHÔNG HỢP LỆ: Hãy trả lời bắt đầu bằng chữ "INVALID: " kèm theo MỘT CÂU GIẢI THÍCH NGẮN GỌN (Ví dụ: "INVALID: Hình ảnh không phải là ${documentType}").`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Hãy kiểm tra xem hình ảnh này có hợp lệ cho yêu cầu "${documentType}" hay không.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUri,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0, // Cần kết quả chắc chắn nhất
      });

      const result = response.choices[0]?.message?.content?.trim() || '';
      console.log(`[AI Verification] Kiểm tra ${documentType} (${filename}): ${result}`);

      if (result.toUpperCase().startsWith('VALID')) {
        return { isValid: true };
      } else {
        const reason = result.replace(/^INVALID:\s*/i, '').trim() || 'Hình ảnh không hợp lệ.';
        return { isValid: false, reason };
      }

    } catch (error) {
      console.error('Lỗi khi gọi OpenAI Vision API:', error);
      throw new BadRequestException('Không thể phân tích hình ảnh này. Vui lòng tải lên một bức ảnh rõ nét hơn ở định dạng chuẩn (JPG, PNG).');
    }
  }
}
