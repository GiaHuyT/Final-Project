"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    ShoppingCart,
    MoreHorizontal,
    Eye,
    FileText,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface Order {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    customer: { username: string };
    _count: { items: number };
}

const statusConfig = {
    PENDING: { label: "Chờ xử lý", color: "secondary", icon: Clock },
    SHIPPING: { label: "Đang giao", color: "default", icon: Truck },
    DELIVERED: { label: "Đã giao", color: "default", icon: CheckCircle2 },
    CANCELLED: { label: "Đã hủy", color: "destructive", icon: XCircle },
};

export default function OrderManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await http.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: number, status: string) => {
        try {
            await http.patch(`/orders/${orderId}/status`, { status });
            toast.success("Cập nhật trạng thái thành công");
            fetchOrders();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        order.customer.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                    <p className="text-muted-foreground">Theo dõi và cập nhật trạng thái các đơn hàng trên hệ thống.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách đơn hàng</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm mã đơn, khách hàng..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 font-medium">
                                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Mã đơn hàng</th>
                                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Khách hàng</th>
                                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Tổng tiền</th>
                                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Ngày đặt</th>
                                        <th className="h-12 px-4 text-left align-middle text-muted-foreground">Trạng thái</th>
                                        <th className="h-12 px-4 text-right align-middle text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                                Không tìm thấy đơn hàng nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                                            return (
                                                <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle font-medium flex items-center gap-3">
                                                        <div className="rounded-md bg-primary/10 p-2">
                                                            <ShoppingCart className="h-4 w-4 text-primary" />
                                                        </div>
                                                        #ORD-{order.id}
                                                    </td>
                                                    <td className="p-4 align-middle">{order.customer.username}</td>
                                                    <td className="p-4 align-middle font-bold">{order.totalPrice.toLocaleString()} ₫</td>
                                                    <td className="p-4 align-middle text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge
                                                            variant={config.color as any}
                                                            className="gap-1.5"
                                                        >
                                                            <config.icon className="h-3 w-3" />
                                                            {config.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Eye className="h-4 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    Hóa đơn (PDF)
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                                                                    disabled={order.status !== 'PENDING'}
                                                                >
                                                                    Giao hàng
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                                    disabled={order.status !== 'SHIPPING'}
                                                                >
                                                                    Hoàn thành
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                                    disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                                                >
                                                                    Hủy đơn
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
