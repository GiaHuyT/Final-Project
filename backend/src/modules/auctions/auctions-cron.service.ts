import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsCronService {
  private readonly logger = new Logger(AuctionsCronService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) { }

  // Chạy mỗi 5 phút
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAuctionNotifications() {
    this.logger.debug('Đang kiểm tra các phiên đấu giá sắp diễn ra...');

    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 35 * 60000); // 35 phút tới
    const bufferStart = new Date(now.getTime() + 25 * 60000);   // 25 phút tới

    // 1. Thông báo sắp BẮT ĐẦU (trong khoảng 30p tới)
    const startingSoon = await this.prisma.auction.findMany({
      where: {
        startTime: {
          gt: bufferStart,
          lt: soonThreshold,
        },
        status: 'PENDING',
      },
    });

    for (const auction of startingSoon) {
      await this.notifications.create(auction.vendorId, {
        type: 'AUCTION' as any,
        content: `Phiên đấu giá "${auction.title}" của bạn sắp bắt đầu (trong khoảng 30 phút).`,
        link: `/auctions/${auction.id}`,
        metadata: { auctionId: auction.id, type: 'STARTING_SOON' },
      });
      this.logger.log(`Notify: Auction ${auction.id} starting soon`);
    }

    // 2. Thông báo sắp KẾT THÚC (trong khoảng 30p tới)
    const endingSoon = await this.prisma.auction.findMany({
      where: {
        endTime: {
          gt: bufferStart,
          lt: soonThreshold,
        },
        status: 'ACTIVE',
      },
    });

    for (const auction of endingSoon) {
      await this.notifications.create(auction.vendorId, {
        type: 'AUCTION' as any,
        content: `Phiên đấu giá "${auction.title}" của bạn sắp kết thúc (trong khoảng 30 phút).`,
        link: `/auctions/${auction.id}`,
        metadata: { auctionId: auction.id, type: 'ENDING_SOON' },
      });
      this.logger.log(`Notify: Auction ${auction.id} ending soon`);
    }

    // 3. Xử lý KẾT THÚC đấu giá và thông báo NGƯỜI THẮNG
    const endedAuctions = await this.prisma.auction.findMany({
      where: {
        endTime: {
          lt: now,
        },
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
      this.logger.log(`Handling conclusion for Auction ${auction.id}`);

      // Cập nhật trạng thái thành FINISHED (giả định có status này hoặc dùng COMPLETED)
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: 'FINISHED' },
      });

      if (auction.bids.length > 0) {
        const winner = auction.bids[0];
        // Thông báo cho Người thắng
        await this.notifications.create(winner.userId, {
          type: 'AUCTION' as any,
          content: `Chúc mừng! Bạn đã thắng phiên đấu giá "${auction.title}" với giá ${winner.bidAmount.toLocaleString()} VNĐ.`,
          link: `/auctions/${auction.id}`,
          metadata: { auctionId: auction.id, bidAmount: winner.bidAmount },
        });

        // Thông báo cho Vendor
        await this.notifications.create(auction.vendorId, {
          type: 'AUCTION' as any,
          content: `Phiên đấu giá "${auction.title}" của bạn đã kết thúc. Người thắng: User #${winner.userId}.`,
          link: `/auctions/${auction.id}`,
          metadata: { auctionId: auction.id, winnerId: winner.userId },
        });
      } else {
        // Không có ai bid
        await this.notifications.create(auction.vendorId, {
          type: 'AUCTION' as any,
          content: `Phiên đấu giá "${auction.title}" của bạn đã kết thúc mà không có lượt đặt giá nào.`,
          link: `/auctions/${auction.id}`,
        });
      }
    }
  }
}
