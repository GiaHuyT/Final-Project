import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class DriverBookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(customerId: number, dto: CreateBookingDto) {
    const booking = await this.prisma.driverBooking.create({
      data: {
        customerId,
        pickupAddress: dto.pickupAddress,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        dropoffAddress: dto.dropoffAddress,
        dropoffLat: dto.dropoffLat,
        dropoffLng: dto.dropoffLng,
        distanceKm: dto.distanceKm,
        totalPrice: dto.totalPrice,
        carType: dto.carType,
        carBrand: dto.carBrand,
        transmission: dto.transmission,
        licensePlate: dto.licensePlate,
        contactPhone: dto.contactPhone,
        requiredLicense: dto.requiredLicense,
        status: 'PENDING',
      },
      include: {
        customer: {
          select: { id: true, username: true, email: true, phonenumber: true, avatar: true }
        }
      }
    });
    return booking;
  }

  async acceptBooking(driverId: number, bookingId: number) {
    // Verify driver exists and has DRIVER role
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      include: { serviceProfiles: { include: { driverRentalServices: true } } }
    });

    if (!driver || !driver.roles.includes('DRIVER')) {
      throw new BadRequestException('Chỉ tài xế mới có thể nhận cuốc.');
    }

    const booking = await this.prisma.driverBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new NotFoundException('Không tìm thấy cuốc xe.');
    if (booking.status !== 'PENDING') throw new BadRequestException('Cuốc xe đã có người nhận hoặc đã hủy.');

    const updatedBooking = await this.prisma.driverBooking.update({
      where: { id: bookingId },
      data: {
        driverId,
        status: 'ACCEPTED',
      },
      include: {
        customer: { select: { id: true, username: true, phonenumber: true } },
        driver: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });

    return updatedBooking;
  }

  async updateBookingStatus(driverId: number, bookingId: number, status: string) {
    const booking = await this.prisma.driverBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Không tìm thấy cuốc xe.');
    if (booking.driverId !== driverId) throw new BadRequestException('Bạn không phải tài xế của cuốc xe này.');

    return this.prisma.driverBooking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        driver: { select: { id: true, username: true, phonenumber: true, avatar: true } },
        customer: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });
  }

  async completeBooking(customerId: number, bookingId: number) {
    const booking = await this.prisma.driverBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Không tìm thấy cuốc xe.');
    if (booking.customerId !== customerId) throw new BadRequestException('Bạn không phải người đặt cuốc xe này.');
    if (booking.status !== 'ARRIVED_AT_DROPOFF') throw new BadRequestException('Cuốc xe chưa đến điểm đích.');

    return this.prisma.driverBooking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: {
        driver: { select: { id: true, username: true, phonenumber: true, avatar: true } },
        customer: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });
  }

  async getCustomerBookings(customerId: number) {
    return this.prisma.driverBooking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });
  }

  async getDriverBookings(driverId: number) {
    return this.prisma.driverBooking.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });
  }

  async getPendingBookings(latStr?: string, lngStr?: string) {
    const bookings = await this.prisma.driverBooking.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, username: true, phonenumber: true, avatar: true } }
      }
    });

    if (latStr && lngStr) {
      const driverLat = parseFloat(latStr);
      const driverLng = parseFloat(lngStr);
      
      if (!isNaN(driverLat) && !isNaN(driverLng)) {
        return bookings.filter(b => {
          if (!b.pickupLat || !b.pickupLng) return true; // keep if no location
          const R = 6371; // Radius of the earth in km
          const dLat = (b.pickupLat - driverLat) * (Math.PI / 180);
          const dLon = (b.pickupLng - driverLng) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(driverLat * (Math.PI / 180)) * Math.cos(b.pickupLat * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
          const distance = R * c; // Distance in km
          
          return distance <= 10; // within 10km
        });
      }
    }

    return bookings;
  }
}
