import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDriverRentalDto } from './dto/create-driver-rental.dto';

@Injectable()
export class DriverRentalService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateDriverRentalDto) {
    let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.serviceProfile.create({
        data: { userId, serviceType: 'DRIVER_RENTAL' },
      });
    }

    return this.prisma.driverRentalService.create({
      data: {
        profileId: profile.id,
        ...createDto,
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
    return this.prisma.driverRentalService.findMany({
      include: {
        profile: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, userId: number, updateDto: any) {
    const service = await this.prisma.driverRentalService.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!service) throw new NotFoundException('Service not found');
    
    return this.prisma.driverRentalService.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, userId: number) {
    const service = await this.prisma.driverRentalService.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!service) throw new NotFoundException('Service not found');

    return this.prisma.driverRentalService.delete({ where: { id } });
  }
}
