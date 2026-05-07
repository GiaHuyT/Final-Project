import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createMaintenanceDto: CreateMaintenanceDto) {
    let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.serviceProfile.create({
        data: { userId, serviceType: 'MAINTENANCE' },
      });
    }

    return this.prisma.maintenanceService.create({
      data: {
        profileId: profile.id,
        ...createMaintenanceDto,
      },
      include: {
        profile: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    });
  }

  async findAllPublic() {
    return this.prisma.maintenanceService.findMany({
      include: {
        profile: {
          include: {
            user: {
              select: { id: true, username: true, email: true, phonenumber: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVendor(userId: number) {
    const profile = await this.prisma.serviceProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    return this.prisma.maintenanceService.findMany({
      where: { profileId: profile.id },
      include: {
        profile: {
          include: {
            user: {
              select: { id: true, username: true, email: true, phonenumber: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, userId: number, updateDto: any) {
    const service = await this.prisma.maintenanceService.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!service) throw new NotFoundException('Service not found');
    
    // In a real app, verify user ownership or admin role here. For now, we just update it.
    return this.prisma.maintenanceService.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, userId: number) {
    const service = await this.prisma.maintenanceService.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!service) throw new NotFoundException('Service not found');

    return this.prisma.maintenanceService.delete({ where: { id } });
  }
}
