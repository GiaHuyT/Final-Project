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
        const orders = await this.prisma.order.findMany({
            include: {
                customer: {
                    select: { username: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            include: { vendor: { select: { username: true, roles: true, qrCodeUrl: true } } }
                        }
                    }
                },
                transactions: {
                    where: { status: 'SUCCESS' }
                },
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return orders.map((order: any) => {
            let actualPaid = 0;
            if (order.transactions && order.transactions.length > 0) {
                actualPaid = order.transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
            }

            let adminCommission = 0;
            let orderTotal = 0;
            
            if (order.items) {
                for (const item of order.items) {
                    orderTotal += item.price * item.quantity;
                    const isVendorAdmin = item.product?.vendor?.roles?.includes('ADMIN');
                    if (!isVendorAdmin) {
                        // If there is actual paid amount, we calculate commission from that amount later
                        if (actualPaid === 0) {
                            adminCommission += (item.price * item.quantity) * 0.1;
                        }
                    }
                }
            }

            if (actualPaid > 0) {
                adminCommission = actualPaid * 0.1;
            }

            return {
                ...order,
                orderTotal,
                paidAmount: actualPaid > 0 ? actualPaid : orderTotal,
                adminCommission
            };
        });
    }

    async findByCustomerId(customerId: number) {
        return this.prisma.order.findMany({
            where: { customerId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { vendor: { select: { username: true, qrCodeUrl: true } } }
                        }
                    }
                },
                transactions: {
                    where: { status: 'SUCCESS' }
                },
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findByVendorId(vendorId: number) {
        const orders = await this.prisma.order.findMany({
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
                },
                transactions: {
                    where: { status: 'SUCCESS' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return orders.map((order: any) => {
            let actualPaid = 0;
            if (order.transactions && order.transactions.length > 0) {
                actualPaid = order.transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
            }

            let vendorTotal = 0;
            if (order.items) {
                const vendorItems = order.items.filter((item: any) => item.product?.vendorId === vendorId);
                for (const item of vendorItems) {
                    vendorTotal += item.price * item.quantity;
                }
            }
            
            const effectiveTotal = actualPaid > 0 ? actualPaid : vendorTotal;

            return {
                ...order,
                vendorTotal: effectiveTotal,
                originalTotal: vendorTotal, // Keep the original car price if needed
                vendorRevenue: effectiveTotal * 0.9,
                paidAmount: effectiveTotal
            };
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

    async transferPayout(id: number) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { payoutStatus: 'TRANSFERRING' },
            include: { items: { include: { product: true } } }
        });

        // Notify vendor
        if (order.items && order.items[0]?.product?.vendorId) {
            const vendorId = order.items[0].product.vendorId;
            await this.notifications.create(vendorId, {
                type: 'SYSTEM' as any,
                content: `Admin đã chuyển khoản thanh toán (Payout) cho hóa đơn #${order.id}. Vui lòng kiểm tra tài khoản và xác nhận.`,
                link: `/vendor/orders`,
                metadata: { orderId: order.id, action: 'payout_transfer' }
            });
        }

        return order;
    }

    async confirmPayout(id: number) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { payoutStatus: 'PAID' },
        });

        // Notify all Admins
        const admins = await this.prisma.user.findMany({ where: { roles: { has: 'ADMIN' } } });
        for (const admin of admins) {
            await this.notifications.create(admin.id, {
                type: 'SYSTEM' as any,
                content: `Vendor đã nhận được tiền và xác nhận đối soát thành công cho hóa đơn #${order.id}.`,
                link: `/admin/payouts`,
                metadata: { orderId: order.id, action: 'payout_confirm' }
            });
        }

        return order;
    }
}
