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

  async finalizeTransaction(orderCode: number, status: 'SUCCESS' | 'FAILED') {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: orderCode },
      include: { order: true, auction: true },
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
          data: { status: 'PAID' },
        });
      }

      if (transaction.auctionId) {
        await this.prisma.auction.update({
          where: { id: transaction.auctionId },
          data: { status: 'COMPLETED' },
        });
      }
    }

    return transaction;
  }
}
