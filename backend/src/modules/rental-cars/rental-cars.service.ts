import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRentalCarDto } from './dto/create-rental-car.dto';

@Injectable()
export class RentalCarsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateRentalCarDto) {
        let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await this.prisma.serviceProfile.create({
                data: { userId, serviceType: 'RENTAL' }
            });
        }
        return this.prisma.rentalCar.create({
            data: { ...dto, profileId: profile.id }
        });
    }

    async findByVendor(userId: number) {
        const profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) return [];
        return this.prisma.rentalCar.findMany({ where: { profileId: profile.id } });
    }

    async update(id: number, dto: any) {
        return this.prisma.rentalCar.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        return this.prisma.rentalCar.delete({ where: { id } });
    }
}
