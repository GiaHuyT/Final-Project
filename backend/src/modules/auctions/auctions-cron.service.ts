import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuctionsService } from './auctions.service';

@Injectable()
export class AuctionsCronService {
  private readonly logger = new Logger(AuctionsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly auctionsService: AuctionsService,
  ) {}

  // Chạy mỗi 1 phút để track được thời gian sát sao hơn
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAuctionState() {
    this.logger.debug('Đang kiểm tra vòng đời Đấu giá (Cron Job 1 phút)...');
    
    const now = new Date();

    // 1. Kích hoạt Phiên đấu giá tới giờ (PENDING -> ACTIVE), và thông báo sắp bắt đầu
    const pendingAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        vendor: { select: { id: true, email: true } }
      }
    });

    for (const auction of pendingAuctions) {
      const startTime = new Date(auction.startTime).getTime();
      const distanceMinutes = Math.round((startTime - now.getTime()) / 60000);

      // Nhắc nhở vendor
      const marks = [15, 10, 5];
      for (const mark of marks) {
        if (distanceMinutes <= mark && distanceMinutes > mark - 5 && distanceMinutes >= 0) {
          const stringToMatch = `"${auction.title}" sẽ bắt đầu trong khoảng ${mark} phút nữa`;
          const existingNotification = await this.prisma.notification.findFirst({
            where: {
              userId: auction.vendorId,
              type: 'SYSTEM',
              content: {
                contains: stringToMatch
              },
              createdAt: {
                gte: new Date(now.getTime() - 30 * 60 * 1000)
              }
            }
          });

          if (!existingNotification) {
            await this.notifications.create(auction.vendorId, {
              type: 'SYSTEM' as any,
              content: `Chú ý: Phiên đấu giá "${auction.title}" sẽ bắt đầu trong khoảng ${mark} phút nữa! Hãy chuẩn bị sẵn sàng.`,
              link: `/vendor/auctions`, 
            });
            this.logger.log(`Notified vendor for auction ${auction.id} starting in ${mark} mins.`);
          }
          break;
        }
      }

      // Kích hoạt
      if (startTime <= now.getTime()) {
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'ACTIVE' },
        });
        this.logger.log(`Auction ${auction.id} changed to ACTIVE.`);
      }
    }

    // 2. Chốt phiên ACTIVE hết giờ mở cửa -> WAITING_PAYMENT
    const endedAuctions = await this.prisma.auction.findMany({
      where: {
        endTime: { lte: now },
        status: 'ACTIVE',
      },
      include: {
        bids: {
          orderBy: { bidAmount: 'desc' },
          take: 1,
        },
      },
    });

    for (const auction of endedAuctions) {
      this.logger.log(`Handling conclusion for Auction ${auction.id}. Moving to WAITING_PAYMENT.`);

      if (auction.bids.length > 0) {
        const winner = auction.bids[0];
        // Cập nhật trạng thái và lưu winnerId
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { 
            status: 'WAITING_PAYMENT',
            winnerId: winner.userId
          },
        });

        // Trigger tạo link cọc PayOS (để gửi sau hoặc user tự bấm)
        await this.auctionsService.triggerPaymentForWinner(auction.id);

        // Báo cho người thắng "Vòng Sinh Tử 5 Phút"
        await this.notifications.create(winner.userId, {
          type: 'AUCTION' as any,
          content: `CHÚ Ý: Bạn đang cầm Top 1 phiên đấu giá "${auction.title}". HÃY NỘP CỌC 5% TRONG 5 PHÚT TỚI NẾU KHÔNG SẼ BỊ HỦY QUYỀN!`,
          link: `/auctions/${auction.id}`,
          metadata: { auctionId: auction.id, bidAmount: winner.bidAmount },
        });

      } else {
        // Không có ai bid luôn -> Kết thúc ế
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'FINISHED' },
        });
        await this.notifications.create(auction.vendorId, {
          type: 'AUCTION' as any,
          content: `Phiên đấu giá "${auction.title}" đã kết thúc buồn bã vì không có lượt đặt giá nào.`,
          link: `/auctions/${auction.id}`,
        });
      }
    }

    // 3. Xử lý Vòng 5 Phút: Nếu hết 5 phút từ lúc endTime mà vẫn WAITING_PAYMENT -> Hủy cọc, hồi sinh phiên
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const unpaidAuctions = await this.prisma.auction.findMany({
      where: {
        endTime: { lte: fiveMinutesAgo }, // Đã quá điểm endTime 5 phút
        status: 'WAITING_PAYMENT',
      },
      include: {
        bids: {
          orderBy: { bidAmount: 'desc' }
        }
      }
    });

    for (const auction of unpaidAuctions) {
      this.logger.warn(`Auction ${auction.id} unpaid after 5 mins! Removing winner and extending.`);

      if (auction.winnerId) {
        // Xóa tất cả các bids của thằng bùng kèo này trong phiên đó để trừng phạt
        await this.prisma.auctionBid.deleteMany({
          where: { auctionId: auction.id, userId: auction.winnerId }
        });

        // Ban user khỏi phòng live này (đổi trạng thái đăng ký thành BANNED)
        await this.prisma.auctionRegistration.updateMany({
          where: { auctionId: auction.id, userId: auction.winnerId },
          data: { status: 'BANNED' }
        });

        await this.notifications.create(auction.winnerId, {
          type: 'SYSTEM' as any,
          content: `Bạn đã bị cấm khỏi phiên đấu giá "${auction.title}" do vi phạm quy chế (không thanh toán cọc đúng hạn). Kỷ lục đặt giá của bạn trong phiên đã bị xóa.`,
          link: `/auctions/${auction.id}`,
        });
      }

      // Xác định currentPrice mới (giá cao nhất của người kế tiếp sau khi xóa top 1)
      const remainingBids = await this.prisma.auctionBid.findMany({
        where: { auctionId: auction.id },
        orderBy: { bidAmount: 'desc' },
        take: 1
      });

      const newCurrentPrice = remainingBids.length > 0 ? remainingBids[0].bidAmount : auction.startPrice;
      
      // Hồi sinh phiên tiếp thêm 5 phút nữa
      const extendedEndTime = new Date(now.getTime() + 5 * 60 * 1000);
      
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: 'ACTIVE',
          winnerId: null,
          endTime: extendedEndTime,
          currentPrice: newCurrentPrice
        }
      });

      // Báo cho toàn hệ thống
      await this.notifications.create(auction.vendorId, {
        type: 'AUCTION' as any,
        content: `Người chơi Top 1 đã BÙNG cọc. Phiên đấu giá "${auction.title}" tự động sống lại thêm 5 phút nữa!`,
        link: `/auctions/${auction.id}`,
      });
    }
  }
}
