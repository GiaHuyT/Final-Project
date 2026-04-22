import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalUsers, totalProducts, totalOrders, totalAuctions] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.product.count(),
            this.prisma.order.count(),
            this.prisma.auction.count({ where: { status: 'ACTIVE' } })
        ]);

        const orderItems = await this.prisma.orderItem.findMany({
            where: { order: { status: 'DELIVERED' } },
            include: { product: { include: { vendor: true } } }
        });

        const totalRevenue = orderItems.reduce((acc, item) => {
            const itemRevenue = item.price * item.quantity;
            if (item.product?.vendor?.role === 'ADMIN') {
                return acc + itemRevenue;
            } else {
                return acc + itemRevenue * 0.1;
            }
        }, 0);

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
            totalRevenue: totalRevenue,
            recentOrders
        };
    }
}
