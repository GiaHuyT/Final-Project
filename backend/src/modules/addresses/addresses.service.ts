import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateAddressDto) {
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    findAll(userId: number) {
        return (this.prisma.address as any).findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: number, id: number) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });

        if (!address || address.userId !== userId) {
            throw new NotFoundException('Address not found');
        }

        return address;
    }

    async update(userId: number, id: number, dto: Partial<CreateAddressDto>) {
        await this.findOne(userId, id);

        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id },
            data: dto,
        });
    }

    async remove(userId: number, id: number) {
        await this.findOne(userId, id);
        return this.prisma.address.delete({
            where: { id },
        });
    }
}
