import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(userData: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data: userData });
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

  findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });
  }
  
  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
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
}
