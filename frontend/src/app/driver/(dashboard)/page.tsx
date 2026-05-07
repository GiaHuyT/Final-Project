"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Package, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import http from '@/lib/http';

export default function DriverHubDashboard() {
    const [activeTab, setActiveTab] = useState('');
    const [shifts, setShifts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        completed: 0,
        cancelled: 0,
        ignored: 0,
        activeMinutes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Ca phụ tải
                const savedDetails = localStorage.getItem('registered_shift_details');
                if (savedDetails) {
                    const parsedShifts = JSON.parse(savedDetails);
                    setShifts(parsedShifts);
                    if (parsedShifts.length > 0) {
                        setActiveTab(parsedShifts[0].id.toString());
                    }
                }

                // 2. Tải số liệu thống kê từ API
                const res = await http.get('/driver-booking/driver');
                if (res.data) {
                    const today = new Date().setHours(0, 0, 0, 0);
                    // Lọc đặt chỗ chỉ trong ngày hôm nay
                    const todaysBookings = res.data.filter((b: any) => {
                        return new Date(b.createdAt).setHours(0, 0, 0, 0) === today;
                    });

                    const completed = todaysBookings.filter((b: any) => b.status === 'COMPLETED').length;
                    const cancelled = todaysBookings.filter((b: any) => ['CANCELLED', 'REJECTED'].includes(b.status)).length;
                    
                    // Giả lập mỗi đơn hoàn thành tính 30 phút hoạt động
                    const activeMinutes = completed * 30;

                    setStats({
                        completed,
                        cancelled,
                        ignored: 0, // Không có tracking bỏ qua trong DB hiện tại
                        activeMinutes
                    });
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const activeShift = shifts.find(s => s.id.toString() === activeTab);
    const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const todayLongStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).replace('thg', 'Thg');

    const formatActiveTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}:${m.toString().padStart(2, '0')}:00`;
    };
    
    // Giả lập tổng thời gian ca là 5 tiếng = 300 phút
    const activePercent = stats.activeMinutes > 0 ? Math.min(100, Math.round((stats.activeMinutes / 300) * 100)) : 0;

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hiệu suất hoạt động</h1>
                <Button variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl px-3 h-9">
                    {todayStr}
                    <Calendar className="ml-2 h-4 w-4 text-slate-400" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
                {shifts.length > 0 ? shifts.map(shift => (
                    <button
                        key={shift.id}
                        onClick={() => setActiveTab(shift.id.toString())}
                        className={`pb-3 shrink-0 text-sm font-medium transition-colors relative flex flex-col items-center gap-0.5 ${
                            activeTab === shift.id.toString() ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="font-bold">{shift.startTime} - {shift.endTime}</span>
                        <span className="text-[12px] font-normal opacity-80">{shift.location || 'Khu vực'}</span>
                        {activeTab === shift.id.toString() && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>
                        )}
                    </button>
                )) : (
                    <div className="pb-3 text-slate-400 text-sm italic">Chưa có ca làm việc nào được đăng ký</div>
                )}
            </div>

            {/* Main Date Card */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">
                        {todayLongStr} {activeShift ? `${activeShift.startTime}-${activeShift.endTime}` : ''}
                    </h2>
                    <div className="flex items-center text-slate-500 font-medium text-[15px]">
                        {activeShift ? activeShift.location : 'Vui lòng đăng ký ca làm việc'}
                    </div>
                    <div className="flex gap-2 pt-2">

                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 px-3 py-1 font-bold">
                            HOÀN TẤT
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Two Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Thời gian hoạt động */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-5 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-full">
                            <Clock className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-emerald-600 text-[15px]">Thời gian hoạt động</h3>
                    </div>
                    <div className="px-5 pb-5 space-y-7">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500 w-28 leading-snug">Tổng thời gian hoạt động</span>
                            <span className="text-base font-bold text-slate-700">{formatActiveTime(stats.activeMinutes)}</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-slate-500">% Thời gian hoạt động</span>
                                <span className="text-[13px] font-bold text-slate-500">{activePercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${activePercent}%` }}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-slate-500 w-32 leading-snug">Tổng thời gian giờ cao điểm</span>
                                <span className="text-[11px] text-slate-400 mt-1">11:00-12:00</span>
                            </div>
                            <span className="text-base font-bold text-slate-700">0:00:00</span>
                        </div>
                    </div>
                </div>

                {/* Đơn trong HUB */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-5 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-full">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-emerald-600 text-[15px]">Đơn trong HUB</h3>
                    </div>
                    <div className="px-5 pb-5 space-y-7">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">Hoàn thành</span>
                            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[13px] font-bold">
                                {stats.completed} <span className="font-medium text-emerald-500/80 ml-0.5">đơn</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">Từ chối / Đã hủy</span>
                            <div className="text-[14px] font-bold text-slate-800">
                                {stats.cancelled} <span className="font-normal text-slate-500 ml-0.5">đơn</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">Bỏ qua</span>
                            <div className="text-[14px] font-bold text-slate-800">
                                {stats.ignored} <span className="font-normal text-slate-500 ml-0.5">đơn</span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
