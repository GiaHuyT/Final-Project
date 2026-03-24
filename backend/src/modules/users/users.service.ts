import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

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

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: number, isApprovedVendor: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isApprovedVendor }
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
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        phonenumber: true,
        avatar: true,
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
}
