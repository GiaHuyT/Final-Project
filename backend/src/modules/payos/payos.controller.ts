import { Controller, Post, Body, Get, Param, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PayosService } from './payos.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { Public } from '../../core/decorators/public.decorator';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('payos')
export class PayosController {
  constructor(
    private readonly payosService: PayosService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService
  ) {}

  @Public()
  @Post('create-payment-link')
  async createPaymentLink(@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    try {
      return await this.payosService.createPaymentLink(createPaymentLinkDto);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Public() // Allow for demonstration/testing; ideally this should be protected
  @Get('payment-detail/:orderCode')
  async getPaymentDetail(@Param('orderCode') orderCode: string) {
    return await this.payosService.getPaymentDetail(Number(orderCode));
  }

  @Public()
  @Post('cancel/:orderCode')
  async cancelPayment(@Param('orderCode') orderCode: string, @Body('reason') reason?: string) {
    const result = await this.payosService.cancelPayment(Number(orderCode), reason);
    await this.transactionsService.finalizeTransaction(Number(orderCode), 'FAILED');
    return result;
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() webhookBody: any) {
    console.log('Received PayOS webhook:', webhookBody);
    const verifiedData = await this.payosService.verifyWebhookData(webhookBody);
    if (!verifiedData) {
      throw new BadRequestException('Webhook signature verification failed');
    }

    if (verifiedData.code === '00') {
      await this.transactionsService.finalizeTransaction(Number(verifiedData.orderCode), 'SUCCESS');
    }

    return { status: 'success', data: verifiedData };
  }

  @Public()
  @Post('lookup-account')
  async lookupAccount(@Body() body: { bin: string, accountNumber: string }) {
    try {
      return await this.payosService.lookupAccount(body.bin, body.accountNumber);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
