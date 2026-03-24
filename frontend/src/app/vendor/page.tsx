'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import {
    Box,
    Clock,
    Truck,
    Wrench,
    TrendingUp,
    LayoutDashboard,
    ArrowUpRight
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function VendorDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRentals: 0,
        totalRepairs: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // We can fetch data in parallel
                const [products, orders, rentals, repairs] = await Promise.all([
                    http.get('/products/vendor/me'),
                    http.get('/orders/vendor/me'),
                    http.get('/rental-cars/vendor/me'),
                    http.get('/repairs/vendor/me')
                ]);

                setStats({
                    totalProducts: products.data?.length || 0,
                    totalOrders: orders.data?.length || 0,
                    totalRentals: rentals.data?.length || 0,
                    totalRepairs: repairs.data?.length || 0
                });
            } catch (error) {
                console.error('Fetch Stats Error:', error);
                toast.error('Không thể tải thông tin thống kê');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statItems = [
        {
            title: "Sản phẩm",
            value: stats.totalProducts,
            icon: Box,
            color: "text-blue-600",
            bg: "bg-blue-100",
            href: "/vendor/products"
        },
        {
            title: "Đơn hàng",
            value: stats.totalOrders,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100",
            href: "/vendor/orders"
        },
        {
            title: "Xe cho thuê",
            value: stats.totalRentals,
            icon: Truck,
            color: "text-green-600",
            bg: "bg-green-100",
            href: "/vendor/rental-cars"
        },
        {
            title: "Yêu cầu sửa chữa",
            value: stats.totalRepairs,
            icon: Wrench,
            color: "text-purple-600",
            bg: "bg-purple-100",
            href: "/vendor/repairs"
        }
    ];

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-800">Tổng quan nhà cung cấp</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
                            <div className={`rounded-full p-2 ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-green-500 font-medium">Cập nhật mới nhất</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Hoạt động kinh doanh</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50/50">
                        <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <span className="text-muted-foreground">Biểu đồ tăng trưởng sẽ hiển thị tại đây</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Thông báo mới</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="py-12 text-center text-gray-400">
                            Chưa có thông báo quan trọng.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
