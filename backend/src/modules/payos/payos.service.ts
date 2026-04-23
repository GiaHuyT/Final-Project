import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayOS } from '@payos/node';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayosService {
  constructor(
    @Inject('PAYOS_CLIENT') private readonly payos: PayOS,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentLink(dto: CreatePaymentLinkDto) {
    try {
      const { orderCode, amount, description, items, cancelUrl, returnUrl } = dto;

      const body = {
        orderCode,
        amount,
        description,
        items: items || [],
        cancelUrl: cancelUrl || this.configService.get<string>('FRONTEND_URL') + '/cancel',
        returnUrl: returnUrl || this.configService.get<string>('FRONTEND_URL') + '/success',
      };

      const paymentLinkRes = await this.payos.paymentRequests.create(body);
      return paymentLinkRes;
    } catch (error: any) {
      console.error('PayOS Create Payment Link Error:', error);
      throw new InternalServerErrorException(error.message || 'Lỗi khi tạo link thanh toán PayOS');
    }
  }

  async getPaymentDetail(orderCode: number) {
    try {
      return await this.payos.paymentRequests.get(orderCode);
    } catch (error: any) {
      console.error('PayOS Get Payment Detail Error:', error);
      throw new InternalServerErrorException(error.message || 'Lỗi khi lấy thông tin thanh toán');
    }
  }

  async cancelPayment(orderCode: number, reason?: string) {
    try {
      return await this.payos.paymentRequests.cancel(orderCode, reason);
    } catch (error: any) {
      console.error('PayOS Cancel Payment Error:', error);
      throw new InternalServerErrorException(error.message || 'Lỗi khi hủy thanh toán');
    }
  }

  async verifyWebhookData(webhookBody: any) {
    try {
      return this.payos.webhooks.verify(webhookBody);
    } catch (error: any) {
      console.error('PayOS Verify Webhook Error:', error);
      return null;
    }
  }

  async lookupAccount(bin: string, accountNumber: string) {
    try {
      const clientId = this.configService.get<string>('CLIENT_ID');
      const apiKey = this.configService.get<string>('API_KEY');
      
      const response = await fetch('https://api.vietqr.io/v2/lookup', {
        method: 'POST',
        headers: {
          'x-client-id': clientId || '',
          'x-api-key': apiKey || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bin,
          accountNumber
        })
      });
      
      return await response.json();
    } catch (error: any) {
      console.error('PayOS Lookup Account Error:', error);
      throw new InternalServerErrorException(error.message || 'Lỗi khi tra cứu tài khoản');
    }
  }
}
