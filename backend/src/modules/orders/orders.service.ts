import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                customer: {
                    select: { username: true, email: true }
                },
                _count: {
                    select: { items: true }
                }
            }
        });
    }

    async findByVendorId(vendorId: number) {
        return this.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: { vendorId }
                    }
                }
            },
            include: {
                customer: {
                    select: { username: true, email: true }
                },
                items: {
                    include: { product: true }
                }
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { username: true, email: true }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async updateStatus(id: number, status: string) {
        return this.prisma.order.update({
            where: { id },
            data: { status }
        });
    }
}
