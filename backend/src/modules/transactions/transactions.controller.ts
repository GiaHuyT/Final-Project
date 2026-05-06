import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':orderCode')
  async getTransaction(@Param('orderCode') orderCode: string) {
    return this.transactionsService.findByOrderCode(Number(orderCode));
  }

  @Post('order/:orderId')
  async createPaymentForOrder(
    @Param('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.transactionsService.createTransactionForOrder(Number(orderId), amount, description);
  }

  @Post('auction/:auctionId')
  async createPaymentForAuction(
    @Param('auctionId') auctionId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.transactionsService.createTransactionForAuction(Number(auctionId), amount, description);
  }
}
