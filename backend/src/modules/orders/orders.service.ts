import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService,
    ) { }

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
        const order = await this.prisma.order.update({
            where: { id },
            data: { status },
            include: { customer: true }
        });

        // Notify customer
        await this.notifications.create(order.customerId, {
            type: 'ORDER' as any,
            content: `Đơn hàng #${order.id} của bạn đã được cập nhật trạng thái: ${status}.`,
            link: `/orders/${order.id}`,
            metadata: { orderId: order.id, status }
        });

        return order;
    }
}
