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
                items: {
                    include: {
                        product: {
                            include: { vendor: { select: { username: true } } }
                        }
                    }
                },
                _count: {
                    select: { items: true }
                }
            }
        });
    }

    async findByCustomerId(customerId: number) {
        return this.prisma.order.findMany({
            where: { customerId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { vendor: { select: { username: true } } }
                        }
                    }
                },
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
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
        if (order.customerId) {
            await this.notifications.create(order.customerId, {
                type: 'ORDER' as any,
                content: `Hồ sơ đặt xe #${order.id} của bạn đã được cập nhật trạng thái: ${status === 'DEPOSITED' ? 'Đã cọc' : status === 'PAID' ? 'Đã thanh toán' : status}.`,
                link: `/orders/${order.id}`,
                metadata: { orderId: order.id, status }
            });
        }

        return order;
    }

    async createManualInvoice(vendorId: number, data: { productId: number; customerId?: number; customerName?: string; price?: number; status: string }, isAdmin = false) {
        const product = await this.prisma.product.findUnique({ where: { id: data.productId } });
        if (!product) {
            throw new Error('Sản phẩm không hợp lệ');
        }
        if (!isAdmin && product.vendorId !== vendorId) {
            throw new Error('Sản phẩm không thuộc quyền quản lý của bạn');
        }

        const order = await this.prisma.order.create({
            data: {
                // If customerName is empty or we don't link a user, we link to a default system user or keep it without customer
                // But schema requires customerId! Let's link it to the vendor themselves as a proxy, or throw error if no guest user
                // Actually, let's use a dummy guest user or require customerId. 
                // Let's assume vendorId can be used as customerId if no customer is selected.
                customerId: data.customerId ? data.customerId : vendorId, // Using vendor's ID as placeholder if no customer is selected
                totalPrice: data.price || product.price,
                status: data.status,
                items: {
                    create: [
                        {
                            productId: product.id,
                            quantity: 1,
                            price: data.price || product.price,
                        }
                    ]
                }
            }
        });

        // Reduce stock
        if (data.status === 'PAID' || data.status === 'DEPOSITED') {
            await this.prisma.product.update({
                where: { id: product.id },
                data: { stock: { decrement: 1 } }
            });
        }

        return order;
    }
}
