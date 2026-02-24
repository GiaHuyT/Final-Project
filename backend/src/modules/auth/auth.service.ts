import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  //Refresh Token
  generateAccessToken(userId: number) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '15m' });
  }
  generateRefreshToken(userId: number) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET });
  }
  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
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
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // LOGIN
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

    // ❗ Không trả password
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phonenumber,
      role: user.role,
      avatar: user.avatar,
    };
  }

  // JWT
  generateToken(user: any) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  // LOGIN API
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

    // Reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Save token to the user DB
    await this.usersService.saveResetToken(user.id, token, expires);

    // Kiểm tra cấu hình email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('LỖI: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trong file .env');
      throw new BadRequestException('Hệ thống gửi mail chưa được cấu hình. Vui lòng liên hệ Admin.');
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bỏ qua lỗi chứng chỉ SSL (Sửa lỗi self-signed certificate)
      },
    });

    const resetLink = `http://localhost:3001/auth/reset-password?token=${token}`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Hệ thống Hỗ trợ" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Khôi phục mật khẩu của bạn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">Khôi phục mật khẩu</h2>
            <p>Chào bạn,</p>
            <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đổi mật khẩu mới</a>
            </p>
            <p>Link này sẽ hết hạn sau 1 giờ.</p>
            <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password (ép kiểu any để tránh lỗi lint nếu Prisma chưa generate xong)
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    } as any);

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }
}
