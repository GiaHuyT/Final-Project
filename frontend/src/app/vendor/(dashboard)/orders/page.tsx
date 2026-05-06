"use client";

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Loader2, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight, Eye, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function VendorOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await http.get('/orders/vendor/me');
            setOrders(response.data || []);
        } catch (error: any) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            await http.patch(`/orders/${orderId}/status`, { status: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            fetchOrders();
        } catch (err) {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    // Removed handleCreateInvoice as it's moved to the create page

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', icon: CheckCircle };
            case 'DEPOSITED':
                return { label: 'Đã cọc', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', icon: CheckCircle };
            case 'CANCELLED':
                return { label: 'Đã hủy', className: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200', icon: XCircle };
            case 'PENDING':
            default:
                return { label: 'Chờ thanh toán cọc', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200', icon: Clock };
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản lý Hóa đơn</h1>
                    <Button 
                        onClick={() => router.push('/vendor/orders/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-xl hover:shadow-blue-600/30 font-bold tracking-tight gap-2"
                    >
                        <Plus className="w-5 h-5" /> Thêm Hóa đơn
                    </Button>
                </div>
                <p className="text-muted-foreground font-medium">Theo dõi và cập nhật trạng thái hóa đơn mua xe từ khách hàng của bạn.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
                <div className="px-10 py-8 border-b bg-gray-50/30">
                    <h2 className="text-xl font-black uppercase tracking-widest text-gray-800 flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        Danh sách hóa đơn mới nhất
                    </h2>
                </div>

                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-10 py-6">Mã Hóa đơn</th>
                                    <th className="px-10 py-6">Khách hàng</th>
                                    <th className="px-10 py-6">Ngày lập</th>
                                    <th className="px-10 py-6">Tổng giá trị xe</th>
                                    <th className="px-10 py-6">Trạng thái xử lý</th>
                                    <th className="px-10 py-6 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-24 text-center text-gray-400 font-bold italic">
                                            Chưa có dữ liệu hóa đơn nào được ghi nhận.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-blue-50/5 transition-colors group">
                                            <td className="px-10 py-6 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-200">
                                                        #{ord.id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 align-middle font-black text-gray-900">
                                                {ord.customer?.username || 'Khách vãng lai'}
                                            </td>
                                            <td className="px-10 py-6 align-middle font-bold text-gray-500">
                                                {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-10 py-6 align-middle">
                                                <div className="font-black text-blue-600 text-base">
                                                    {ord.totalPrice.toLocaleString('vi-VN')} 
                                                    <span className="text-[10px] font-black opacity-60 ml-1 uppercase">đ</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 align-middle">
                                                {(() => {
                                                    const config = getStatusConfig(ord.status);
                                                    return (
                                                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 uppercase text-[9px] font-black shadow-sm border-2 ${config.className}`}>
                                                            <config.icon className="w-3.5 h-3.5" />
                                                            {config.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-10 py-6 align-middle text-right flex items-center justify-end gap-3">
                                                <select
                                                    value={ord.status}
                                                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                                    className="h-10 px-4 rounded-xl border border-gray-100 bg-white font-bold text-xs shadow-sm hover:border-blue-300 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-100"
                                                >
                                                    <option value="PENDING">Chờ thanh toán cọc</option>
                                                    <option value="DEPOSITED">Đã cọc</option>
                                                    <option value="PAID">Đã thanh toán (Nhận xe)</option>
                                                    <option value="CANCELLED">Đã hủy</option>
                                                </select>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/vendor/orders/${ord.id}`)}
                                                    className="h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Eye className="w-4 h-4" /> Chi tiết & Xuất Hóa đơn
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
