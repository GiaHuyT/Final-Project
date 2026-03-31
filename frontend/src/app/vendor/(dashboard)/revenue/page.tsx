"use client";

import { TrendingUp } from 'lucide-react';

export default function VendorRevenuePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h1>
                <p className="text-sm text-muted-foreground">Theo dõi hiệu quả kinh doanh và doanh thu từ các dịch vụ của bạn.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Chưa có dữ liệu doanh thu để hiển thị.</p>
            </div>
        </div>
    );
}
