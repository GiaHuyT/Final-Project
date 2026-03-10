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
}
