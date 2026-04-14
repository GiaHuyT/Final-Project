import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getVendorRevenueReport(vendorId: number, startDateStr?: string, endDateStr?: string, groupBy: string = 'day') {
    // Parse dates based on groupBy
    // If we only get YYYY-MM, we set start to day 1, and end to last day.
    // If year, start to Jan 1st, end to Dec 31st.
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(new Date().setDate(endDate.getDate() - 6));

    if (groupBy === 'month') {
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
    } else if (groupBy === 'year') {
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
    }

    // Set hours to cover the whole day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        product: { vendorId: vendorId },
        order: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: { order: true },
      orderBy: { order: { createdAt: 'asc' } },
    });

    const revenueMap = new Map<string, number>();

    // Initial fill for all intervals in range to ensure empty intervals are shown
    let curr = new Date(startDate);
    while (curr <= endDate) {
      let dateStr = '';
      if (groupBy === 'day') {
        dateStr = curr.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        curr.setDate(curr.getDate() + 1);
      } else if (groupBy === 'month') {
        dateStr = curr.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' });
        curr.setMonth(curr.getMonth() + 1);
      } else if (groupBy === 'year') {
        dateStr = curr.getFullYear().toString();
        curr.setFullYear(curr.getFullYear() + 1);
      }
      if (!revenueMap.has(dateStr)) revenueMap.set(dateStr, 0);
    }

    const orderStatusMap = new Map<string, number>();
    const processedOrders = new Set<number>();

    let totalRevenue = 0;

    for (const item of orderItems) {
      if (!item.order) continue;

      const orderDate = new Date(item.order.createdAt);
      let dateStr = '';
      if (groupBy === 'day') {
        dateStr = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      } else if (groupBy === 'month') {
        dateStr = orderDate.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' });
      } else if (groupBy === 'year') {
        dateStr = orderDate.getFullYear().toString();
      }

      const itemRevenue = item.price * item.quantity;
      if (revenueMap.has(dateStr)) {
        revenueMap.set(dateStr, revenueMap.get(dateStr)! + itemRevenue);
      }
      totalRevenue += itemRevenue;

      if (!processedOrders.has(item.orderId)) {
        processedOrders.add(item.orderId);
        const status = item.order.status || 'PENDING';
        orderStatusMap.set(status, (orderStatusMap.get(status) || 0) + 1);
      }
    }

    const revenueChart = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    const deliveryChart = Array.from(orderStatusMap.entries()).map(([status, count]) => ({
      status: this.translateStatus(status),
      count,
    }));

    return {
      totalRevenue,
      revenueData: revenueChart,
      deliveryData: deliveryChart,
    };
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Đang chờ xử lý',
      'PROCESSING': 'Đang lấy hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Hủy giao - chưa nhận',
    };
    return statusMap[status] || status;
  }
}
