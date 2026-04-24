"use client";

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Package, CheckCircle2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


export default function DriverHubDashboard() {
    const [activeTab, setActiveTab] = useState('unregistered');

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hiệu suất hoạt động</h1>
                <Button variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl px-3 h-9">
                    29/03/2026
                    <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('active_shift')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex flex-col items-center gap-0.5 ${
                        activeTab === 'active_shift' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <span className="font-bold">10:30 - 15:30</span>
                    <span className="text-[12px] font-normal opacity-80">Thanh Xuan E</span>
                    {activeTab === 'active_shift' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>
                    )}
                </button>
            </div>

            {/* Main Date Card */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">29 Thg 03 2026 10:30-15:30</h2>
                    <div className="flex items-center text-slate-500 font-medium text-[15px]">
                        Thanh Xuan E
                    </div>
                    <div className="flex gap-2 pt-2">

                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 px-3 py-1 font-bold">
                            HOÀN TẤT
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Three Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
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
                            <span className="text-base font-bold text-slate-700">2:22:18</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-slate-500">% Thời gian hoạt động</span>
                                <span className="text-[13px] font-bold text-slate-500">47.43%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '47.43%' }}></div>
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
                                14 <span className="font-medium text-emerald-500/80 ml-0.5">đơn</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">Từ chối / Đã hủy</span>
                            <div className="text-[14px] font-bold text-slate-800">
                                0 <span className="font-normal text-slate-500 ml-0.5">đơn</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">Bỏ qua</span>
                            <div className="text-[14px] font-bold text-slate-800">
                                0 <span className="font-normal text-slate-500 ml-0.5">đơn</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tự động nhận đơn 100% */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-5 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-emerald-600 text-[15px] leading-tight">Tự động nhận đơn<br/>100%</h3>
                    </div>
                    <div className="px-5 pb-5 flex flex-col items-center justify-center space-y-5">
                        <div className="w-full bg-slate-50/50 border border-slate-100 rounded-[16px] p-4 flex items-center justify-between">
                            <span className="font-bold text-[14px] text-slate-800">Chuyến xe</span>
                            <div className="flex items-center text-emerald-600 font-bold text-[13px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                ĐẠT
                            </div>
                        </div>
                        <p className="text-[12px] text-center text-slate-400 leading-relaxed px-1">
                            Tính năng tự động nhận đơn giúp bạn tăng tỉ lệ hoàn thành và nhận nhiều đặc quyền hơn.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
