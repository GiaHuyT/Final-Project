"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Receipt, ArrowLeft, Car } from "lucide-react";
import { format } from "date-fns";

export default function MyInvoicesPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await http.get('/orders/customer/me');
                setOrders(res.data || []);
            } catch (error) {
                console.error("Error fetching invoices:", error);
                toast.error("Không thể tải danh sách hóa đơn");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 group font-bold text-sm tracking-tight">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại Gara
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">Hóa đơn của tôi</h1>
                        <p className="text-slate-500 font-medium text-lg">Quản lý lịch sử mua xe và các khoản thanh toán.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tổng số hóa đơn</p>
                            <p className="text-xl font-black text-slate-900">{orders.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-20 text-center bg-white shadow-sm min-h-[500px]">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                                <Receipt className="w-10 h-10 text-slate-200" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Bạn chưa có hóa đơn nào</h3>
                        <p className="text-base font-medium text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Hãy khám phá các mẫu xe mới nhất tại hệ thống AutoBid và sắm cho mình một chiếc xe ưng ý nhé.</p>
                        <Link href="/categories" className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20">
                            Mua xe ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Receipt className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-slate-900">Mã hóa đơn: #{order.id}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : order.status === 'DEPOSITED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {order.status === 'PAID' ? 'Đã thanh toán' : order.status === 'DEPOSITED' ? 'Đã cọc' : order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                            {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl md:w-80 shrink-0 border border-slate-100">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                                            <div className="flex items-center gap-2 text-slate-700 truncate">
                                                <Car className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{item.product?.name || 'Sản phẩm'}</span>
                                            </div>
                                            <div className="font-bold text-slate-900 shrink-0">x {item.quantity}</div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Tổng tiền</div>
                                        <div className="text-xl font-black text-blue-600">{order.totalPrice.toLocaleString('vi-VN')} đ</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
