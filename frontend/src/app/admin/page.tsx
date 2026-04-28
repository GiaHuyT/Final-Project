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

    useEffect(() => {
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
                <div className="md:col-span-7 bg-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-blue-900/5 border border-slate-100">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-blue-100 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -ml-10 -mb-10 transition-all duration-700 group-hover:bg-indigo-100"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                    <span className="text-[11px] uppercase tracking-widest font-black text-slate-500">Tổng doanh thu hệ thống</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
                                    {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} <span className="text-3xl font-bold text-slate-400">₫</span>
                                </h2>
                            </div>
                            <button onClick={fetchStats} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-sm">sync</span> 
                                Cập nhật
                            </button>
                        </div>
                        {/* Mini Revenue Chart Projection Wrapper */}
                        <div className="flex items-end gap-2.5 h-28 mt-10">
                            {[30, 45, 35, 60, 50, 75, 100].map((h, i) => (
                                <div key={i} className="w-full relative group/bar cursor-crosshair" style={{ height: `${h}%` }}>
                                    <div className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ease-out group-hover/bar:scale-y-110 origin-bottom ${i >= 5 ? 'bg-gradient-to-t from-blue-600 to-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-100 hover:bg-slate-200'}`} style={{ height: '100%' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Growth Module */}
                <div className="md:col-span-5 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-xl shadow-emerald-900/5 border border-emerald-100 group">
                    <div className="absolute top-1/2 right-0 w-48 h-48 bg-white rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-125"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                                    <span className="material-symbols-outlined text-emerald-600">group</span>
                                </div>
                                <span className="text-[11px] uppercase tracking-widest font-black text-emerald-700">Tổng người dùng</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mt-4 text-emerald-950">{stats?.totalUsers || 0}</h2>
                        </div>
                        <div className="mt-8 p-5 bg-white/60 rounded-2xl backdrop-blur-md border border-white shadow-sm">
                            <p className="text-sm text-emerald-800 font-medium leading-relaxed">Thành viên và nhà cung cấp đang hoạt động ổn định trên nền tảng.</p>
                        </div>
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
                                    <div className="text-sm font-bold text-slate-900">{order.totalPrice.toLocaleString('vi-VN')} ₫</div>
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
