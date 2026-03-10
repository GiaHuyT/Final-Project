import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalUsers, totalProducts, totalOrders, totalAuctions, revenue] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.product.count(),
            this.prisma.order.count(),
            this.prisma.auction.count({ where: { status: 'ACTIVE' } }),
            this.prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { totalPrice: true }
            })
        ]);

        // Lấy 5 đơn hàng mới nhất
        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { username: true } }
            }
        });

        return {
            totalUsers,
            totalProducts,
            totalOrders,
            activeAuctions: totalAuctions,
            totalRevenue: revenue._sum.totalPrice || 0,
            recentOrders
        };
    }
}
