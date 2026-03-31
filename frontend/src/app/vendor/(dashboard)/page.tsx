"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
            {/* Hero Section: Precision Metrics */}
            <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Tổng quan cửa hàng</h2>
                        <p className="text-slate-500 mt-2">Theo dõi số lượng hàng hóa và đơn hàng thực tế của cửa hàng AutoBid.</p>
                    </div>
                </div>

                {/* Bento Grid Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Orders Metric */}
                    <div className="md:col-span-2 p-8 rounded-xl bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="relative z-10">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Tổng số lượng Đơn hàng</span>
                            <h3 className="text-5xl font-extrabold tracking-tighter text-slate-900">{stats?.totalOrders || 0}</h3>
                            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>Hoạt động tốt</span>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-5 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 200 100">
                                <path d="M0 80 Q 50 10, 100 50 T 200 20" fill="none" stroke="currentColor" strokeWidth="4"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Active Listings */}
                    <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div>
                            <span className="material-symbols-outlined text-blue-600 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block">Xe (Sản phẩm)</span>
                            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900">{stats?.totalProducts || 0}</h3>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-6">
                            <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
                        </div>
                    </div>

                    {/* Rentals & Repairs */}
                    <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div>
                            <span className="material-symbols-outlined text-orange-500 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block">Dịch vụ (Thuê/Sửa)</span>
                            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900">{(stats?.totalRentals || 0) + (stats?.totalRepairs || 0)}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            <span>Sẵn sàng phục vụ</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Activity Table */}
            <section>
                <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden mt-8">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Đơn hàng mới nhất</h3>
                        <span className="text-blue-600 text-xs font-bold">Thông tin chi tiết</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats?.recentOrders?.length === 0 ? (
                            <div className="px-8 py-8 text-center text-slate-500">Chưa có giao dịch/đơn hàng nào.</div>
                        ) : (
                            stats?.recentOrders?.map((order: any, idx: number) => (
                                <div key={idx} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-orange-600">receipt_long</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Mã đơn: #{order.id}</div>
                                            <div className="text-xs text-slate-500">Khách hàng: {order.customer?.username || 'Ẩn danh'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900">{order.totalPrice.toLocaleString()} ₫</div>
                                        <div className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                                        <div className={`text-[10px] items-center justify-center px-2 py-0.5 rounded-full inline-flex font-bold mt-1 uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : order.status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

