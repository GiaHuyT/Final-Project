import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayosService } from '../payos/payos.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
  ) {}

  async createTransactionForOrder(orderId: number, amount: number, description: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId,
        amount,
        status: 'PENDING',
      },
    });

    const paymentLinkRes = await this.payosService.createPaymentLink({
      orderCode: transaction.id,
      amount,
      description,
    });

    return {
      transaction,
      checkoutUrl: paymentLinkRes.checkoutUrl,
    };
  }

  async createTransactionForAuction(auctionId: number, amount: number, description: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        auctionId,
        amount,
        status: 'PENDING',
      },
    });

    const expiredAt = Math.floor(Date.now() / 1000) + 5 * 60; // 5 phút

    const paymentLinkRes = await this.payosService.createPaymentLink({
      orderCode: transaction.id,
      amount,
      description,
      expiredAt,
    });

    return {
      transaction,
      checkoutUrl: paymentLinkRes.checkoutUrl,
    };
  }

  async finalizeTransaction(orderCode: number, status: 'SUCCESS' | 'FAILED') {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: orderCode },
      include: { 
        order: {
          include: {
            items: true
          }
        }, 
        auction: true 
      },
    });

    if (!transaction) throw new NotFoundException('Giao dịch không tồn tại');
    if (transaction.status !== 'PENDING') return transaction;

    await this.prisma.transaction.update({
      where: { id: orderCode },
      data: { status },
    });

    if (status === 'SUCCESS') {
      if (transaction.orderId) {
        await this.prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'DEPOSITED' },
        });

        // Set depositEndsAt for the products in the order (7 days from now)
        if (transaction.order?.items?.length > 0) {
          const productIds = transaction.order.items.map(item => item.productId);
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          await this.prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { depositEndsAt: sevenDaysFromNow }
          });
        }
      }

      if (transaction.auctionId) {
        await this.prisma.auction.update({
          where: { id: transaction.auctionId },
          data: { status: 'COMPLETED' },
        });
      }
    } else if (status === 'FAILED') {
      if (transaction.auctionId && transaction.auction?.status === 'WAITING_PAYMENT') {
        const auction = transaction.auction;
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
        }

        // Xác định currentPrice mới (giá cao nhất của người kế tiếp sau khi xóa top 1)
        const remainingBids = await this.prisma.auctionBid.findMany({
          where: { auctionId: auction.id },
          orderBy: { bidAmount: 'desc' },
          take: 1
        });

        const newCurrentPrice = remainingBids.length > 0 ? remainingBids[0].bidAmount : auction.startPrice;
        
        // Hồi sinh phiên tiếp thêm 5 phút nữa
        const extendedEndTime = new Date(Date.now() + 5 * 60 * 1000);
        
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: {
            status: 'ACTIVE',
            winnerId: null,
            endTime: extendedEndTime,
            currentPrice: newCurrentPrice
          }
        });
      }
    }

    return transaction;
  }

  async findByOrderCode(orderCode: number) {
    let transaction = await this.prisma.transaction.findUnique({
      where: { id: orderCode },
      include: {
        order: {
          include: {
            customer: {
              select: { username: true, email: true, phonenumber: true }
            },
            items: {
              include: {
                product: {
                  select: { id: true, name: true, price: true, depositEndsAt: true }
                }
              }
            }
          }
        },
        auction: true
      }
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Tự động kiểm tra trạng thái thực tế từ PayOS nếu đang PENDING (đặc biệt hữu ích khi localhost không nhận được Webhook)
    if (transaction.status === 'PENDING') {
      try {
        const payosData = await this.payosService.getPaymentDetail(orderCode);
        if (payosData && payosData.status === 'PAID') {
          await this.finalizeTransaction(orderCode, 'SUCCESS');
          
          // Lấy lại dữ liệu mới nhất sau khi cập nhật
          transaction = await this.prisma.transaction.findUnique({
            where: { id: orderCode },
            include: {
              order: {
                include: {
                  customer: {
                    select: { username: true, email: true, phonenumber: true }
                  },
                  items: {
                    include: {
                      product: {
                        select: { id: true, name: true, price: true, depositEndsAt: true }
                      }
                    }
                  }
                }
              },
              auction: true
            }
          });
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái PayOS fallback:', error);
      }
    }

    return transaction;
  }
}
