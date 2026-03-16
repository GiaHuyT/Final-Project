import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.product.findMany({
            include: {
                category: true,
                vendor: {
                    select: { username: true, email: true }
                }
            }
        });
    }

    async findByVendorId(vendorId: number) {
        return this.prisma.product.findMany({
            where: { vendorId },
            include: {
                category: true,
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                vendor: {
                    select: { username: true, email: true }
                }
            }
        });
    }

    async updateStatus(id: number, status: boolean) {
        return this.prisma.product.update({
            where: { id },
            data: { status }
        });
    }

    async create(vendorId: number, data: any) {
        return this.prisma.product.create({
            data: { ...data, vendorId, categoryId: parseInt(data.categoryId) }
        });
    }

    async update(id: number, vendorId: number, data: any) {
        return this.prisma.product.update({
            where: { id },
            data: { ...data, categoryId: data.categoryId ? parseInt(data.categoryId) : undefined }
        });
    }

    async remove(id: number) {
        return this.prisma.product.delete({
            where: { id }
        });
    }
}
