"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Loader2,
    Gavel
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

interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    activeAuctions: number;
    totalRevenue: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await http.get('/dashboard/stats');
                setStats(response.data);
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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const statItems = [
        {
            title: "Tổng người dùng",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Sản phẩm",
            value: stats?.totalProducts || 0,
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: "Đấu giá đang chạy",
            value: stats?.activeAuctions || 0,
            icon: Gavel,
            color: "text-orange-600",
            bg: "bg-orange-100"
        },
        {
            title: "Doanh thu",
            value: `${(stats?.totalRevenue || 0).toLocaleString()} ₫`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
                <p className="text-muted-foreground">Chào mừng bạn trở lại, quản trị viên.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
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
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ phát triển</CardTitle>
                        <CardDescription>
                            Thống kê lượng người dùng và sản phẩm mới trong hệ thống.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                        <span className="text-muted-foreground">Biểu đồ sẽ hiển thị tại đây</span>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <CardDescription>Các đơn hàng mới nhất trên hệ thống.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentOrders.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-8">Chưa có đơn hàng nào.</p>
                            ) : (
                                stats?.recentOrders.map((order: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                                        <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">#ORD-{order.id} - {order.totalPrice.toLocaleString()} ₫</p>
                                            <p className="text-xs text-muted-foreground">Khách: {order.customer.username}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] scale-90 origin-right">
                                            {order.status === 'PENDING' ? 'Chờ' : order.status}
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
