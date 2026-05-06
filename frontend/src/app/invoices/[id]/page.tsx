"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Receipt, ArrowLeft, Car, Calendar, CreditCard, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceDetailPage() {
    const params = useParams();
    const id = params.id;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await http.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (error) {
                console.error("Error fetching order detail:", error);
                toast.error("Không thể tải chi tiết hóa đơn");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-6">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy hóa đơn</h2>
                <p className="text-slate-500 mb-8">Hóa đơn này không tồn tại hoặc bạn không có quyền xem.</p>
                <Link href="/invoices" className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const depositAmount = Math.round(order.totalPrice * 0.00001);

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-4xl mx-auto">
                <Link href="/invoices" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group font-bold text-sm tracking-tight w-fit">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách hóa đơn
                </Link>

                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Receipt className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Chi tiết hóa đơn #{order.id}</h1>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : order.status === 'DEPOSITED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {order.status === 'PAID' ? 'Đã thanh toán' : order.status === 'DEPOSITED' ? 'Đã cọc' : order.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-left md:text-right space-y-2">
                            <p className="text-sm font-medium text-slate-500 flex items-center md:justify-end gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                            <p className="text-sm font-medium text-slate-500 flex items-center md:justify-end gap-2">
                                <User className="w-4 h-4" />
                                {order.customer?.username || 'Khách hàng'}
                            </p>
                            <p className="text-sm font-medium text-slate-500 flex items-center md:justify-end gap-2">
                                {order.customer?.email}
                            </p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" /> Danh sách xe
                        </h3>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="w-24 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.product?.imageUrl || "/images/static/car-placeholder.png"} alt={item.product?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.product?.name || 'Sản phẩm'}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Đơn giá: {item.price.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-slate-400 mb-1">Số lượng: {item.quantity}</p>
                                        <p className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-end gap-12">
                        <div className="w-full md:w-80 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-500">Tổng giá trị đơn hàng</span>
                                <span className="font-bold text-slate-900">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                            
                            {order.status === 'DEPOSITED' && (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-500">Tỷ lệ cọc</span>
                                        <span className="font-bold text-slate-900">0.001%</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <span className="font-bold uppercase tracking-widest text-amber-500 text-xs">Đã thanh toán cọc</span>
                                        <span className="text-xl font-black text-amber-600">{depositAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold uppercase tracking-widest text-slate-500 text-xs">Còn lại phải thanh toán</span>
                                        <span className="text-lg font-black text-slate-900">{(order.totalPrice - depositAmount).toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </>
                            )}

                            {order.status === 'PAID' && (
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <span className="font-bold uppercase tracking-widest text-emerald-500 text-xs">Đã thanh toán toàn bộ</span>
                                    <span className="text-xl font-black text-emerald-600">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}

                            {order.status === 'PENDING' && (
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <span className="font-bold uppercase tracking-widest text-slate-500 text-xs">Cần thanh toán</span>
                                    <span className="text-xl font-black text-blue-600">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
