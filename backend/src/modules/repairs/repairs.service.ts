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

    async createCapacity(userId: number, dto: any) {
        let profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await this.prisma.serviceProfile.create({
                data: { userId, serviceType: 'REPAIR' }
            });
        }
        return this.prisma.repairCapacity.create({
            data: { ...dto, profileId: profile.id }
        });
    }

    async getCapacitiesByVendor(userId: number) {
        const profile = await this.prisma.serviceProfile.findUnique({ where: { userId } });
        if (!profile) return [];
        return this.prisma.repairCapacity.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: 'desc' } });
    }

    async getAllCapacities() {
        return this.prisma.repairCapacity.findMany({
            include: {
                profile: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true, phonenumber: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getCapacityById(id: number) {
        return this.prisma.repairCapacity.findUnique({
            where: { id },
            include: {
                profile: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true, phonenumber: true, email: true } }
                    }
                }
            }
        });
    }

    async updateCapacity(id: number, dto: any) {
        return this.prisma.repairCapacity.update({ where: { id }, data: dto });
    }

    async deleteCapacity(id: number) {
        return this.prisma.repairCapacity.delete({ where: { id } });
    }

    async update(id: number, dto: any) {
        return this.prisma.repairService.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        return this.prisma.repairService.delete({ where: { id } });
    }
}
