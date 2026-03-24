'use client';

import React from 'react';

export default function VendorRevenuePage() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Báo cáo doanh thu</h1>
            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                Chưa có dữ liệu doanh thu để hiển thị.
            </div>
        </div>
    );
}
