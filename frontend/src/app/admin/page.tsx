"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

    return (
        <div className="p-8 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tổng quan hệ thống</h1>
                <p className="text-slate-500 mt-2">Giám sát doanh thu, người dùng và các giao dịch gần đây.</p>
            </div>

            {/* Hero Metrics (Asymmetric Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Revenue Highlight */}
                <div className="md:col-span-7 bg-white border border-slate-100 p-8 rounded-xl flex flex-col justify-between relative overflow-hidden group shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Tổng doanh thu hệ thống</span>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-1 text-slate-900">
                                    {(stats?.totalRevenue || 0).toLocaleString()} ₫
                                </h2>
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span> Cập nhật
                            </div>
                        </div>
                        {/* Mini Revenue Chart Projection Wrapper */}
                        <div className="flex items-end gap-1 h-32 mt-8">
                            {[40, 55, 45, 70, 60, 85, 95].map((h, i) => (
                                <div key={i} className={`w-full rounded-t-sm ${i >= 5 ? 'bg-blue-600' : 'bg-slate-100'}`} style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Growth Module */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-100 p-8 rounded-xl flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Tổng người dùng</span>
                        <h2 className="text-4xl font-extrabold tracking-tighter mt-1 text-slate-900">{stats?.totalUsers || 0}</h2>
                        <p className="text-sm text-slate-500 mt-2">Thành viên và nhà cung cấp hoạt động trên nền tảng.</p>
                    </div>
                </div>
            </div>

            {/* Technical Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Auctions */}
                <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-xl relative">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-orange-500">gavel</span>
                        <h3 className="font-bold text-slate-700">Đấu giá đang mở</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-900">{stats?.activeAuctions || 0} <span className="text-sm font-normal text-slate-400">phiên</span></div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-3/4"></div>
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-blue-600">directions_car</span>
                        <h3 className="font-bold text-slate-700">Tổng Sản phẩm</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-900">{stats?.totalProducts || 0} <span className="text-sm font-normal text-slate-400">xe</span></div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-full"></div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-green-600">shopping_cart</span>
                        <h3 className="font-bold text-slate-700">Tổng đơn hàng</h3>
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-900">{stats?.totalOrders || 0} <span className="text-sm font-normal text-slate-400">lượt</span></div>
                     <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-2/3"></div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions / Logs */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Giao dịch gần đây</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {stats?.recentOrders?.length === 0 ? (
                        <div className="px-8 py-8 text-center text-slate-500">Chưa có giao dịch/đơn hàng nào.</div>
                    ) : (
                        stats?.recentOrders?.map((order: any, idx: number) => (
                            <div key={idx} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Mã đơn: #{order.id}</div>
                                        <div className="text-xs text-slate-500">Khách hàng: {order.customer?.username || 'Unknown'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">{order.totalPrice.toLocaleString()} ₫</div>
                                    <div className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                                    <div className="text-[10px] font-bold mt-1 uppercase text-blue-600">{order.status}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
