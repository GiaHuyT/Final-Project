"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    CheckCircle2,
    Clock,
    Loader2,
    Wallet
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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface Order {
    id: number;
    totalPrice: number;
    adminCommission?: number;
    status: string;
    payoutStatus: string;
    createdAt: string;
    customer: { username: string };
    items?: { product?: { vendor?: { username: string; qrCodeUrl?: string } } }[];
    _count: { items: number };
    paidAmount?: number;
}

export default function AdminPayoutsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Trạng thái hộp thoại QR
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{ id: number, qrUrl: string, amount: number } | null>(null);

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

    const handlePayoutTransfer = async () => {
        if (!selectedOrder) return;
        try {
            await http.patch(`/orders/${selectedOrder.id}/payout/transfer`);
            toast.success("Đã thông báo cho Vendor kiểm tra tài khoản!");
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, payoutStatus: 'TRANSFERRING' } : o));
            setIsQrDialogOpen(false);
            setSelectedOrder(null);
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    // Only show DEPOSITED, DELIVERED or PAID orders
    const payoutOrders = orders.filter(order => order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'DEPOSITED');

    const filteredOrders = payoutOrders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        (order.items?.[0]?.product?.vendor?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-extrabold uppercase tracking-tighter">Đối soát thanh toán</h1>
                    <p className="text-muted-foreground font-medium">Quản lý việc chuyển tiền (Payout) lại cho Vendor sau khi đơn hàng thành công.</p>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-blue-900">Danh sách cần đối soát</CardTitle>
                            <CardDescription className="font-bold text-blue-600/60 uppercase text-[10px] tracking-widest mt-1">
                                Các đơn hàng đã nhận tiền và cần chuyển lại 90% cho Vendor
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Tìm mã hóa đơn, tên vendor..."
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
                                        <th className="px-8 py-5 border-b">Nhà cung cấp</th>
                                        <th className="px-8 py-5 border-b text-right">Tổng tiền thu (100%)</th>
                                        <th className="px-8 py-5 border-b text-right">Hoa hồng (10%)</th>
                                        <th className="px-8 py-5 border-b text-right text-emerald-600">Cần trả Vendor (90%)</th>
                                        <th className="px-8 py-5 border-b text-center">Trạng thái Payout</th>
                                        <th className="px-8 py-5 border-b text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                                Chưa có đơn hàng nào cần đối soát.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const isPaid = order.payoutStatus === 'PAID';
                                            const vendorName = order.items && order.items.length > 0
                                                ? Array.from(new Set(order.items.map(item => item.product?.vendor?.username).filter(Boolean))).join(', ') || 'Hệ thống'
                                                : 'Đang tải...';

                                            if (vendorName === 'Hệ thống') return null; // Bỏ qua đơn hàng của chính Admin

                                            const paidAmount = order.paidAmount || order.totalPrice;
                                            const commission = order.adminCommission || (paidAmount * 0.1);
                                            const vendorPayout = paidAmount - commission;

                                            return (
                                                <tr key={order.id} className="hover:bg-blue-50/10 transition-colors group">
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="flex items-center gap-4">
                                                            <div className="rounded-2xl bg-blue-100/50 p-2.5 border border-blue-200 group-hover:scale-110 transition-transform">
                                                                <Wallet className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <span className="font-black text-gray-900 tracking-tighter text-base">#INV-{order.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle">
                                                        <div className="font-bold text-gray-700">{vendorName}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Đối tác phân phối</div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-right">
                                                        <div className="font-bold text-slate-500">
                                                            {paidAmount.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">đ</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-right">
                                                        <div className="font-black text-slate-700">
                                                            {commission.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">đ</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-right">
                                                        <div className="font-black text-emerald-600 text-lg">
                                                            {vendorPayout.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">đ</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-center">
                                                        {order.payoutStatus === 'PAID' ? (
                                                            <Badge variant="outline" className="gap-2 rounded-full px-3 py-1 uppercase text-[10px] font-black bg-emerald-100 text-emerald-700 border-emerald-200">
                                                                <CheckCircle2 className="h-3 w-3" /> Đã hoàn tất
                                                            </Badge>
                                                        ) : order.payoutStatus === 'TRANSFERRING' ? (
                                                            <Badge variant="outline" className="gap-2 rounded-full px-3 py-1 uppercase text-[10px] font-black bg-blue-100 text-blue-700 border-blue-200">
                                                                <Clock className="h-3 w-3" /> Chờ Vendor xác nhận
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="gap-2 rounded-full px-3 py-1 uppercase text-[10px] font-black bg-amber-100 text-amber-700 border-amber-200">
                                                                <Clock className="h-3 w-3" /> Chờ chuyển tiền
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 align-middle text-right">
                                                        {order.payoutStatus === 'PENDING' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const qrUrl = order.items?.[0]?.product?.vendor?.qrCodeUrl;
                                                                    if (!qrUrl) {
                                                                        toast.error("Vendor này chưa cập nhật mã QR. Vui lòng liên hệ Vendor cập nhật QR trong hồ sơ.");
                                                                        return;
                                                                    }
                                                                    setSelectedOrder({ id: order.id, qrUrl, amount: vendorPayout });
                                                                    setIsQrDialogOpen(true);
                                                                }}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest h-8"
                                                            >
                                                                Thanh toán QR
                                                            </Button>
                                                        )}
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
            <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-center text-blue-900">MÃ QR THANH TOÁN</DialogTitle>
                        <DialogDescription className="text-center font-bold">
                            Vui lòng dùng ứng dụng ngân hàng quét mã QR dưới đây để chuyển <span className="text-emerald-600">{selectedOrder?.amount?.toLocaleString('vi-VN')} đ</span> cho Vendor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl my-4">
                        {selectedOrder?.qrUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedOrder.qrUrl} alt="Vendor QR" className="w-64 h-64 object-contain rounded-xl border-4 border-white shadow-lg" />
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                                Lỗi QR
                            </div>
                        )}
                        <p className="text-xs text-gray-500 font-medium text-center mt-6">
                            Sau khi chuyển khoản thành công trên điện thoại, hãy bấm nút xác nhận bên dưới để thông báo cho Vendor kiểm tra tài khoản.
                        </p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setIsQrDialogOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                        <Button onClick={handlePayoutTransfer} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                            Đã chuyển thành công
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
