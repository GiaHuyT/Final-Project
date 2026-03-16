import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRepairDto } from './dto/create-repair.dto';

@Injectable()
export class RepairsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateRepairDto) {
        let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await this.prisma.serviceProfile.create({
                data: { userId, serviceType: 'REPAIR' }
            });
        }
        return this.prisma.repairService.create({
            data: { ...dto, profileId: profile.id }
        });
    }

    async findByVendor(userId: number) {
        const profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) return [];
        return this.prisma.repairService.findMany({ where: { profileId: profile.id } });
    }

    async update(id: number, dto: any) {
        return this.prisma.repairService.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        return this.prisma.repairService.delete({ where: { id } });
    }
}
