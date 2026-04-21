import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private configService: ConfigService,
  ) {}

  async create(data: any) {
    const contact = await this.prisma.contactRequest.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject === 'other' ? (data.otherSubject || 'Khác') : data.subject,
        message: data.message,
      },
    });

    // Bắn thông báo qua websocket tới tất cả Admin
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM',
        content: `Có yêu cầu hỗ trợ mới từ khách hàng ${contact.name}!`,
        link: '/admin/contacts',
      });
    }

    return contact;
  }

  async findAll() {
    return this.prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: string) {
    const contact = await this.prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    // Gửi email báo khách hàng đã fix xong
    if (status === 'RESOLVED') {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      try {
        await transporter.sendMail({
          from: `"Hệ thống Hỗ trợ AutoBid" <${this.configService.get('EMAIL_USER')}>`,
          to: contact.email,
          subject: 'Phản hồi Yêu cầu Hỗ trợ - AutoBid',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
              <h2 style="color: #10b981; text-align: center;">YÊU CẦU ĐÃ ĐƯỢC XỬ LÝ</h2>
              <p>Xin chào <strong>${contact.name}</strong>,</p>
              <p>Ban quản trị AutoBid trân trọng thông báo: Yêu cầu hỗ trợ của bạn (Chủ đề: <strong>${contact.subject}</strong>) đã được bộ phận chăm sóc khách hàng tiếp nhận và xử lý thành công.</p>
              <p>Nếu bạn còn thắc mắc, vui lòng phản hồi email này hoặc liên hệ qua đường dây nóng của AutoBid.</p>
              <br/>
              <p>Trân trọng,</p>
              <p><strong>Ban Quản trị AutoBid</strong></p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Failed to send email to customer:', err);
      }
    }

    return contact;
  }
}
