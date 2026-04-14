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

    // 1. Kích hoạt Phiên đấu giá tới giờ (PENDING -> ACTIVE)
    const startingNow = await this.prisma.auction.findMany({
      where: {
        startTime: { lte: now },
        status: 'PENDING',
      },
    });

    for (const auction of startingNow) {
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: 'ACTIVE' },
      });
      this.logger.log(`Auction ${auction.id} changed to ACTIVE.`);
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

        // Báo cho người thắng "Vòng Sinh Tử 10 Phút"
        await this.notifications.create(winner.userId, {
          type: 'AUCTION' as any,
          content: `CHÚ Ý: Bạn đang cầm Top 1 phiên đấu giá "${auction.title}". HÃY NỘP CỌC 10% TRONG 10 PHÚT TỚI NẾU KHÔNG SẼ BỊ HỦY QUYỀN!`,
          link: `/auctions/${auction.id}/deposit`,
          metadata: { auctionId: auction.id, bidAmount: winner.bidAmount },
        });

      } else {
        // Không có ai bid luôn -> Kết thúc ế
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'CANCELLED' },
        });
        await this.notifications.create(auction.vendorId, {
          type: 'AUCTION' as any,
          content: `Phiên đấu giá "${auction.title}" đã kết thúc buồn bã vì không có lượt đặt giá nào.`,
          link: `/auctions/${auction.id}`,
        });
      }
    }

    // 3. Xử lý Vòng 10 Phút: Nếu hết 10 phút từ lúc endTime mà vẫn WAITING_PAYMENT -> Hủy cọc, hồi sinh phiên
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const unpaidAuctions = await this.prisma.auction.findMany({
      where: {
        endTime: { lte: tenMinutesAgo }, // Đã quá điểm endTime 10 phút
        status: 'WAITING_PAYMENT',
      },
      include: {
        bids: {
          orderBy: { bidAmount: 'desc' }
        }
      }
    });

    for (const auction of unpaidAuctions) {
      this.logger.warn(`Auction ${auction.id} unpaid after 10 mins! Removing winner and extending.`);

      if (auction.winnerId) {
        // Xóa tất cả các bids của thằng bùng kèo này trong phiên đó để trừng phạt
        await this.prisma.auctionBid.deleteMany({
          where: { auctionId: auction.id, userId: auction.winnerId }
        });

        await this.notifications.create(auction.winnerId, {
          type: 'SYSTEM' as any,
          content: `Bạn đã bị tước quyền thắng đấu giá "${auction.title}" do không thanh toán cọc đúng hạn (10 phút). Kỷ lục đặt giá của bạn trong phiên đã bị xóa.`,
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
      
      // Hồi sinh phiên tiếp thêm 10 phút nữa
      const extendedEndTime = new Date(now.getTime() + 10 * 60 * 1000);
      
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
        content: `Người chơi Top 1 đã BÙNG cọc. Phiên đấu giá "${auction.title}" tự động sống lại thêm 10 phút nữa!`,
        link: `/auctions/${auction.id}`,
      });
    }
  }
}
