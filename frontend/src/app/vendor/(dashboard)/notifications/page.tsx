"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Check, Package, Gavel, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';
import { io, Socket } from 'socket.io-client';

export default function VendorNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/notifications');
            setNotifications(data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Connect to Socket.io
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
        const userStr = localStorage.getItem('user');
        let socket: Socket | null = null;

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                socket = io(API_URL, {
                    transports: ['websocket'],
                    query: { userId: user.id }
                });

                socket.on('connect', () => {
                    console.log('Socket connected for notifications');
                });

                socket.on('new_notification', (newNotif) => {
                    setNotifications(prev => [newNotif, ...prev]);
                    toast.success("Bạn có thông báo mới!");
                    window.dispatchEvent(new Event('notifications-updated'));
                });
            } catch (e) {
                console.error(e);
            }
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Prevent row click navigation
        try {
            await http.patch(`/notifications/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await http.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("Đã đánh dấu tất cả là đã đọc");
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleNotificationClick = (notif: any) => {
        if (!notif.isRead) {
            handleMarkAsRead(notif.id);
        }
        if (notif.link) {
            router.push(notif.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <Package className="w-5 h-5 text-blue-500" />;
            case 'AUCTION': return <Gavel className="w-5 h-5 text-amber-500" />;
            case 'SYSTEM': return <Settings className="w-5 h-5 text-gray-500" />;
            default: return <AlertCircle className="w-5 h-5 text-emerald-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'ORDER': return 'bg-blue-50 border-blue-100';
            case 'AUCTION': return 'bg-amber-50 border-amber-100';
            case 'SYSTEM': return 'bg-gray-50 border-gray-100';
            default: return 'bg-emerald-50 border-emerald-100';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return "Vừa xong";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                        <Bell className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Theo dõi các cập nhật mới nhất dành cho bạn.</p>
                    </div>
                </div>
                
                {unreadCount > 0 && (
                    <Button 
                        onClick={handleMarkAllAsRead}
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 font-bold rounded-xl"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Đang tải thông báo...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <Bell className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Trống trải quá!</h3>
                        <p className="text-gray-500">Bạn chưa có thông báo nào từ hệ thống.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-5 flex gap-4 transition-all cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {notif.content}
                                        </p>
                                        {!notif.isRead && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full shrink-0 transition-colors flex items-center gap-1"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400">
                                        {formatTime(notif.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
