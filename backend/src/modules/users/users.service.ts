import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import type { Prisma, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) { }

  async create(userData: any) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return (this.prisma.user as any).create({ data: userData });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByPhoneNumber(phonenumber: string) {
    return this.prisma.user.findUnique({ where: { phonenumber } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(vendorRequestPending?: boolean) {
    const where: Prisma.UserWhereInput = {};
    if (vendorRequestPending !== undefined) {
      where.vendorRequestPending = vendorRequestPending;
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: number, isApprovedVendor: boolean) {
    const user = await (this.prisma.user as any).update({
      where: { id },
      data: { 
        isApprovedVendor,
        vendorRequestPending: false,
        pendingRequestType: null
      }
    });

    await this.notifications.create(id, {
      type: 'SYSTEM' as any,
      content: isApprovedVendor 
        ? 'Chúc mừng! Tài khoản Vendor của bạn đã được phê duyệt.'
        : 'Rất tiếc, yêu cầu đăng ký làm Nhà cung cấp (Vendor) của bạn đã bị từ chối.',
      link: '/profile',
    });

    return user;
  }

  async applyVendor(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.isApprovedVendor) throw new BadRequestException('Bạn đã là Nhà cung cấp');
    if (user.vendorRequestPending) throw new BadRequestException('Yêu cầu của bạn đang chờ xử lý');

    await (this.prisma.user as any).update({
      where: { id: userId },
      data: { 
        vendorRequestPending: true,
        pendingRequestType: 'VENDOR_REGISTRATION'
      }
    });

    // Thông báo cho Admin
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        type: 'SYSTEM' as any,
        content: `Người dùng ${user.username} đã gửi yêu cầu đăng ký làm Nhà cung cấp (Vendor).`,
        link: '/admin/users', // Giả định có trang quản lý user
      });
    }

    return { message: 'Đã gửi yêu cầu đăng ký thành công' };
  }

  async switchRole(userId: number, role: 'CUSTOMER' | 'VENDOR') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    
    if (role === 'VENDOR' && !user.isApprovedVendor) {
      throw new BadRequestException('Tài khoản chưa được phê duyệt quyền Vendor');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  async updateRole(id: number, role: any) {
    return this.prisma.user.update({
      where: { id },
      data: { role }
    });
  }

  async toggleActive(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } }) as any;
    return (this.prisma.user as any).update({
      where: { id },
      data: { isActive: !user.isActive }
    });
  }

  findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        },
      },
    });
  }

  async update(id: number, data: any) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException(`ID người dùng không hợp lệ: ${id}`);
    }

    try {
      const updateData: any = {};
      
      // Chỉ lấy các trường hợp lệ để tránh lỗi Prisma
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      
      if (data.phonenumber !== undefined) {
        updateData.phonenumber = data.phonenumber === "" ? null : data.phonenumber;
      }

      if (data.password && typeof data.password === 'string' && data.password !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
      }


      return await this.prisma.user.update({
        where: { id: Number(id) },
        data: updateData,
      });
    } catch (error) {
      console.error(`[UsersService] Lỗi cập nhật User ID ${id}:`, error);
      throw new BadRequestException('Không thể cập nhật thông tin người dùng. ' + error.message);
    }
  }

  async saveResetToken(id: number, token: string, expires: Date) {
    return this.prisma.user.update({
      where: { id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });
  }

  async getProfile(userId: number) {
    return (this.prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        phonenumber: true,
        avatar: true,
        role: true,
        isApprovedVendor: true,
        vendorRequestPending: true,
        pendingRequestType: true,
        createdAt: true,
      }
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findVendors() {
    return this.prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
      orderBy: { username: 'asc' }
    });
  }

  async findVendorPublicProfile(id: number) {
    const vendor = await (this.prisma.user as any).findFirst({
      where: { 
        id: Number(id),
        isApprovedVendor: true 
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        role: true,
        products: {
          where: { status: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            brand: true,
            year: true,
            mileage: true,
            condition: true,
          }
        },
      },
    });

    if (!vendor) {
      throw new BadRequestException('Không tìm thấy nhà cung cấp hoặc tài khoản chưa được xác minh.');
    }

    return vendor;
  }
}
