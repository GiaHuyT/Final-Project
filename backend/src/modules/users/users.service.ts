import { Injectable } from '@nestjs/common';
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
    // If password is empty string, don't update it
    if (data.password === "") {
      delete data.password;
    }

    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return (this.prisma.user as any).update({
      where: { id },
      data,
    });
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
}
