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
    Loader2,
    Plus
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
import { useRouter } from 'next/navigation';

interface Order {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    customer: { username: string };
    items?: { product?: { vendor?: { username: string } } }[];
    _count: { items: number };
}

const statusConfig = {
    PENDING: { label: "Chờ thanh toán cọc", className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200", icon: Clock },
    DEPOSITED: { label: "Đã cọc", className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200", icon: CheckCircle2 },
    PAID: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200", icon: CheckCircle2 },
    CANCELLED: { label: "Đã hủy", className: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200", icon: XCircle },
};

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await http.get('/orders');
            setOrders(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Removed handleUpdateStatus because Admin should not update order shipping status

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        order.customer.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-extrabold uppercase tracking-tighter">Quản lý hóa đơn</h1>
                    <p className="text-muted-foreground font-medium">Theo dõi và cập nhật trạng thái hóa đơn mua xe trên toàn hệ thống.</p>
                </div>
                <Button 
                    onClick={() => router.push('/admin/orders/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-xl hover:shadow-blue-600/30 font-bold tracking-tight gap-2 h-12"
                >
                    <Plus className="w-5 h-5" /> Thêm Hóa đơn
                </Button>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-blue-900">Danh sách hóa đơn</CardTitle>
                            <CardDescription className="font-bold text-blue-600/60 uppercase text-[10px] tracking-widest mt-1">Tổng cộng {orders.length} hóa đơn hệ thống</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Tìm mã hóa đơn, khách hàng..."
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
                                        <th className="px-8 py-5 border-b">Mã hóa đơn</th>
                                        <th className="px-8 py-5 border-b">Khách hàng</th>
                                        <th className="px-8 py-5 border-b">Nhà cung cấp</th>
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
                                                Không tìm thấy dữ liệu hóa đơn phù hợp.
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
                                                            <span className="font-black text-gray-900 tracking-tighter text-base">#INV-{order.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-black text-gray-900">{order.customer.username}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Thành viên hệ thống</div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-bold text-gray-700">
                                                            {order.items && order.items.length > 0 
                                                                ? Array.from(new Set(order.items.map(item => item.product?.vendor?.username).filter(Boolean))).join(', ') || 'Hệ thống'
                                                                : 'Đang tải...'}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Đối tác phân phối</div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-black text-orange-600 text-base">
                                                            {order.totalPrice.toLocaleString('vi-VN')} <span className="text-[10px] font-black opacity-60 ml-0.5 uppercase">vnđ</span>
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
                                                            variant="outline"
                                                            className={`gap-2 rounded-full px-4 py-1.5 uppercase text-[10px] font-black shadow-sm border-2 ${config.className}`}
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
                                                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 px-4 py-3 tracking-widest text-center">Quản trị hóa đơn</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="mb-2" />
                                                                <DropdownMenuItem 
                                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                                    className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Chi tiết & Xuất Hóa đơn
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
