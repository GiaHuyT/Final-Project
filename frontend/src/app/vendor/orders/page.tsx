"use client";

import { useEffect, useState } from 'react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Loader2, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/orders/vendor/me');
            setOrders(data || []);
        } catch (error: any) {
            toast.error('Không thể tải danh sách đơn hàng');
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

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'SHIPPING': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PROCESSING': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-orange-50 text-orange-700 border-orange-200';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'SHIPPING': return <Truck className="w-3.5 h-3.5" />;
            case 'CANCELLED': return <XCircle className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản lý Đơn hàng</h1>
                <p className="text-muted-foreground font-medium">Theo dõi và cập nhật trạng thái các đơn hàng từ khách hàng của bạn.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
                <div className="px-10 py-8 border-b bg-gray-50/30">
                    <h2 className="text-xl font-black uppercase tracking-widest text-gray-800 flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-orange-600" />
                        Danh sách đơn hàng mới nhất
                    </h2>
                </div>

                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-14 w-14 animate-spin text-orange-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-10 py-6">Mã Đơn hàng</th>
                                    <th className="px-10 py-6">Khách hàng</th>
                                    <th className="px-10 py-6">Ngày đặt</th>
                                    <th className="px-10 py-6">Tổng thanh toán</th>
                                    <th className="px-10 py-6">Trạng thái xử lý</th>
                                    <th className="px-10 py-6 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-24 text-center text-gray-400 font-bold italic">
                                            Chưa có dữ liệu đơn hàng nào được ghi nhận.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-orange-50/5 transition-colors group">
                                            <td className="px-10 py-6 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-orange-100/50 flex items-center justify-center text-orange-600 font-black text-xs border border-orange-200">
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
                                                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 uppercase text-[9px] font-black shadow-sm border-2 ${getStatusStyles(ord.status)}`}>
                                                    <StatusIcon status={ord.status} />
                                                    {ord.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 align-middle text-right">
                                                <select
                                                    value={ord.status}
                                                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                                    className="h-10 px-4 rounded-xl border border-gray-100 bg-white font-bold text-xs shadow-sm hover:border-orange-300 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-orange-100"
                                                >
                                                    <option value="PENDING">Chờ xử lý</option>
                                                    <option value="PROCESSING">Đang chuẩn bị</option>
                                                    <option value="SHIPPING">Đang giao hàng</option>
                                                    <option value="COMPLETED">Đã hoàn thành</option>
                                                    <option value="CANCELLED">Hủy bỏ đơn</option>
                                                </select>
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
