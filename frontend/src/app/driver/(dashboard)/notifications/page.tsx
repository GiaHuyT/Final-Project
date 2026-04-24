"use client";

import React, { useState } from 'react';
import { 
    Bell, 
    CheckCheck, 
    Car, 
    Wallet, 
    ShieldAlert, 
    Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'booking',
        title: 'Bạn có cuốc xe mới: Lái xe hộ',
        message: 'Khách hàng Nguyễn Văn A đang chờ tại Landmark 81. Vui lòng xác nhận trong vòng 60 giây.',
        time: 'Vừa xong',
        isRead: false,
    },
    {
        id: 2,
        type: 'earnings',
        title: 'Nhận thành công 150.000đ',
        message: 'Tiền chuyến xe TRP-88219 đã được cộng vào tài khoản của bạn.',
        time: '2 giờ trước',
        isRead: true,
    },
    {
        id: 3,
        type: 'system',
        title: 'Cập nhật Quy chế Lái xe hộ',
        message: 'Từ ngày 01/05, yêu cầu 100% đối tác phải sử dụng găng tay trắng khi lái xe của khách hàng.',
        time: 'Hôm qua, 15:30',
        isRead: false,
    },
    {
        id: 4,
        type: 'alert',
        title: 'Cảnh báo tuyến đường ngập nước',
        message: 'Khu vực đường Nguyễn Hữu Cảnh hiện đang ngập sâu, đối tác lưu ý chọn lộ trình tránh ngập.',
        time: '22/04/2026',
        isRead: true,
    },
    {
        id: 5,
        type: 'earnings',
        title: 'Yêu cầu rút tiền thành công',
        message: 'Lệnh rút 1.000.000đ về Vietcombank đã hoàn tất.',
        time: '20/04/2026',
        isRead: true,
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'booking': return <Car className="w-5 h-5 text-sky-600" />;
            case 'earnings': return <Wallet className="w-5 h-5 text-emerald-600" />;
            case 'system': return <Info className="w-5 h-5 text-indigo-600" />;
            case 'alert': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
            default: return <Bell className="w-5 h-5 text-slate-600" />;
        }
    };

    const getIconBg = (type: string) => {
        switch(type) {
            case 'booking': return 'bg-sky-100';
            case 'earnings': return 'bg-emerald-100';
            case 'system': return 'bg-indigo-100';
            case 'alert': return 'bg-rose-100';
            default: return 'bg-slate-100';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
                        <p className="text-slate-500 mt-1">Cập nhật thông tin mới nhất từ hệ thống</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={markAllAsRead}>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Đánh dấu đã đọc
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.map(notification => (
                        <Card key={notification.id} className={cn(
                            "border-none shadow-sm transition-colors relative overflow-hidden",
                            notification.isRead ? "bg-white" : "bg-emerald-50/30"
                        )}>
                            {!notification.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                            )}
                            <CardContent className="p-5">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                        getIconBg(notification.type)
                                    )}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={cn(
                                                "text-[16px] mb-1",
                                                notification.isRead ? "text-slate-700 font-medium" : "text-slate-900 font-bold"
                                            )}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[15px] leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
