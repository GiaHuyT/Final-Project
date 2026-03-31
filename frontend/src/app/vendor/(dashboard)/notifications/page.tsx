"use client";

import { Bell } from 'lucide-react';

export default function VendorNotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                <p className="text-sm text-muted-foreground">Xem các thông báo mới nhất từ hệ thống và khách hàng.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Bạn không có thông báo mới.</p>
            </div>
        </div>
    );
}
