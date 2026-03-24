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

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await http.get('/orders');
            setOrders(response.data);
        } catch (error) {
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
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-extrabold uppercase tracking-tighter">Quản lý đơn hàng</h1>
                <p className="text-muted-foreground font-medium">Theo dõi và cập nhật trạng thái đơn hàng trên toàn hệ thống.</p>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-blue-900">Danh sách đơn hàng</CardTitle>
                            <CardDescription className="font-bold text-blue-600/60 uppercase text-[10px] tracking-widest mt-1">Tổng cộng {orders.length} đơn hàng hệ thống</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Tìm mã đơn, khách hàng..."
                                className="pl-12 h-12 rounded-2xl bg-white border-gray-200 focus:ring-4 focus:ring-blue-100 font-bold transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left border-separate border-spacing-0">
                                <thead className="bg-gray-100/80 text-gray-500 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-5 border-b">Mã đơn hàng</th>
                                        <th className="px-8 py-5 border-b">Khách hàng</th>
                                        <th className="px-8 py-5 border-b">Tổng tiền</th>
                                        <th className="px-8 py-5 border-b">Ngày đặt</th>
                                        <th className="px-8 py-5 border-b text-center">Trạng thái</th>
                                        <th className="px-8 py-5 border-b text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                                Không tìm thấy dữ liệu đơn hàng phù hợp.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                                            return (
                                                <tr key={order.id} className="hover:bg-blue-50/10 transition-colors group">
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="flex items-center gap-4">
                                                            <div className="rounded-2xl bg-blue-100/50 p-2.5 border border-blue-200 group-hover:scale-110 transition-transform">
                                                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <span className="font-black text-gray-900 tracking-tighter text-base">#ORD-{order.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-black text-gray-900">{order.customer.username}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Thành viên hệ thống</div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-black text-orange-600 text-base">
                                                            {order.totalPrice.toLocaleString()} <span className="text-[10px] font-black opacity-60 ml-0.5 uppercase">vnđ</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle font-bold text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-center">
                                                        <Badge
                                                            variant={config.color as any}
                                                            className="gap-2 rounded-full px-4 py-1.5 uppercase text-[10px] font-black shadow-sm border-2"
                                                        >
                                                            <config.icon className="h-3 w-3" />
                                                            {config.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all">
                                                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-[1.5rem] border-none shadow-3xl p-3 min-w-[180px]">
                                                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 px-4 py-3 tracking-widest text-center">Quản trị đơn</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="mb-2" />
                                                                <DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter">
                                                                    <Eye className="h-4 w-4" />
                                                                    Chi tiết sản phẩm
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter">
                                                                    <FileText className="h-4 w-4" />
                                                                    Xuất hóa đơn
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-2" />
                                                                <DropdownMenuItem
                                                                    className="gap-3 rounded-xl px-4 py-3 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer font-black text-xs uppercase tracking-tighter disabled:opacity-30"
                                                                    onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                                                                    disabled={order.status !== 'PENDING'}
                                                                >
                                                                    <Truck className="h-4 w-4" />
                                                                    Xác nhận giao
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter disabled:opacity-30"
                                                                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                                    disabled={order.status !== 'SHIPPING'}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    Đã tới nơi
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="gap-3 text-red-600 rounded-xl px-4 py-3 focus:bg-red-50 focus:text-red-600 cursor-pointer font-black text-xs uppercase tracking-tighter disabled:opacity-30"
                                                                    onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                                    disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                    Hủy bỏ ngay
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
