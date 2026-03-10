import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.category.findUnique({
            where: { id }
        });
    }

    async create(name: string) {
        return this.prisma.category.create({
            data: { name }
        });
    }

    async remove(id: number) {
        return this.prisma.category.delete({
            where: { id }
        });
    }
}
