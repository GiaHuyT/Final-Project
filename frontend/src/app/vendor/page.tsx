"use client";

import React, { useEffect, useState } from 'react';
import {
    Box,
    Clock,
    Truck,
    Wrench,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    Package,
    ShoppingCart,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface VendorStats {
    totalProducts: number;
    totalOrders: number;
    totalRentals: number;
    totalRepairs: number;
    recentOrders: any[];
}

export default function VendorDashboard() {
    const [stats, setStats] = useState<VendorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Simulate fetching stats by fetching all lists
                const [productsRes, ordersRes, rentalsRes, repairsRes] = await Promise.all([
                    http.get('/products/vendor/me'),
                    http.get('/orders/vendor/me'),
                    http.get('/rental-cars/vendor/me'),
                    http.get('/repairs/vendor/me')
                ]);

                setStats({
                    totalProducts: productsRes.data.length,
                    totalOrders: ordersRes.data.length,
                    totalRentals: rentalsRes.data.length,
                    totalRepairs: repairsRes.data.length,
                    recentOrders: ordersRes.data.slice(0, 5)
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
                toast.error("Không thể tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    const statItems = [
        {
            title: "Sản phẩm",
            value: stats?.totalProducts || 0,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Đơn hàng",
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: "Xe thuê",
            value: stats?.totalRentals || 0,
            icon: Truck,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: "Sửa chữa",
            value: stats?.totalRepairs || 0,
            icon: Wrench,
            color: "text-orange-600",
            bg: "bg-orange-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-800">Tổng quan cửa hàng</h1>
                <p className="text-muted-foreground">Chào mừng bạn quay lại quản lý cửa hàng của mình.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
                            <div className={`rounded-full p-2 ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-green-500 font-medium">Cập nhật mới nhất</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Hiệu quả kinh doanh</CardTitle>
                        <CardDescription>
                            Biểu đồ thống kê lượng sản phẩm và đơn hàng theo thời gian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50/50">
                        <span className="text-muted-foreground italic flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Dữ liệu biểu đồ đang được cập nhật...
                        </span>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Đơn hàng mới</CardTitle>
                        <CardDescription>Danh sách 5 đơn hàng gần nhất.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentOrders.length === 0 ? (
                                <p className="text-sm text-center text-gray-400 py-12 italic">Chưa có đơn hàng nào.</p>
                            ) : (
                                stats?.recentOrders.map((order: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="mt-0.5 rounded-full bg-orange-50 p-2">
                                            <Clock className="h-3.5 w-3.5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none text-gray-800">#{order.id} - {order.totalPrice.toLocaleString()} ₫</p>
                                            <p className="text-xs text-gray-500">Khách: {order.customer?.username || 'Ẩn danh'}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] scale-90 origin-right px-2 py-0",
                                            order.status === 'COMPLETED' ? "border-green-200 text-green-700 bg-green-50" :
                                            order.status === 'SHIPPING' ? "border-blue-200 text-blue-700 bg-blue-50" :
                                            "border-yellow-200 text-yellow-700 bg-yellow-50"
                                        )}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
