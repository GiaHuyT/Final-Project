import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notifications: NotificationsService,
  ) { }

  // JWT TOKENS
  generateToken(user: any) {
    const payload = {
      sub: user.id,
      roles: user.roles,
    };

    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  generateAccessToken(userId: number, roles: string[]) {
    return this.jwtService.sign({ sub: userId, roles }, { expiresIn: '24h' });
  }

  generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: '7d',
        secret: this.configService.get('JWT_REFRESH_SECRET') || 'REFRESH_SECRET',
      },
    );
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || 'REFRESH_SECRET',
    });
  }

  // REGISTER
  async register(userDTO: RegisterDto) {
    if (userDTO.password !== userDTO.confirmpassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUserByEmail = await this.usersService.findByEmail(userDTO.email);
    if (existingUserByEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUserByPhone = await this.usersService.findByPhoneNumber(
      userDTO.phonenumber,
    );
    if (existingUserByPhone) {
      throw new BadRequestException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(userDTO.password, 10);

    const user = await this.usersService.create({
      username: userDTO.username,
      email: userDTO.email,
      phonenumber: userDTO.phonenumber,
      password: userDTO.password, // Pass plain password, UserService will hash it
    });

    // Notify Admins
    const admins = await this.usersService.findAll(); // Should filter for ADMIN in a real scenario
    const adminList = admins.filter(u => u.roles.includes('ADMIN'));
    for (const admin of adminList) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM' as any,
        content: `Người dùng mới đăng ký: ${user.username} (${user.email || user.phonenumber})`,
        link: `/admin/users/${user.id}`,
      });
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  // VALIDATION & LOGIN
  async validateUser(identifier: string, password: string) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const user = isEmail
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByPhoneNumber(identifier);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phonenumber,
      roles: user.roles,
      avatar: user.avatar,
    };
  }

  async validateUserById(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Sai email/phone hoặc mật khẩu');
    }

    return this.generateToken(user);
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.saveResetToken(user.id, token, expires);

    if (!this.configService.get('EMAIL_USER') || !this.configService.get('EMAIL_PASS')) {
      console.error('LỖI: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trong file .env');
      throw new BadRequestException('Hệ thống gửi mail chưa được cấu hình. Vui lòng liên hệ Admin.');
    }

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

    const resetLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3001'}/auth/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: `"Hệ thống Hỗ trợ" <${this.configService.get('EMAIL_USER')}>`,
        to: user.email,
        subject: 'Khôi phục mật khẩu của bạn',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Auto<span style="color: #2563eb;">Bid</span></h1>
                <p style="color: #94a3b8; margin-top: 10px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Khôi Phục Đặc Quyền</p>
              </div>
              
              <!-- Body -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; font-weight: 700;">Yêu cầu đặt lại mật khẩu</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Chào bạn,<br><br>
                  Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn trên hệ thống AutoBid. Để tiếp tục hành trình và bảo vệ tài sản của bạn, vui lòng thiết lập mật khẩu mới bằng cách nhấn vào nút dưới đây.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">Thiết Lập Mật Khẩu Mới</a>
                </div>
                
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308; margin-bottom: 30px;">
                  <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong vòng <strong>1 giờ</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và tài khoản của bạn vẫn được an toàn.
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5;">
                  © 2026 AutoBid. Độc quyền & Bảo mật.<br>
                  Đây là email tự động từ hệ thống, vui lòng không trả lời.
                </p>
              </div>

            </div>
          </div>
        `,
      });
      return { message: 'Email khôi phục mật khẩu đã được gửi thành công' };
    } catch (error) {
      console.error('Lỗi gửi mail reset password:', error.message);
      throw new BadRequestException('Không thể gửi mail lúc này. Vui lòng thử lại sau hoặc liên hệ Admin.');
    }
  }

  // RESET PASSWORD
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new BadRequestException('Mã xác nhận không hợp lệ hoặc đã hết hạn');

    await this.usersService.update(user.id, {
      password: newPassword,
      resetToken: null,
      resetTokenExpires: null,
    } as any);

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }
}
