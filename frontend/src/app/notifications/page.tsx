"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, CheckCheck, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import http from "@/lib/http";
import { initSocket, getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await http.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await http.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await http.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    useEffect(() => {
        const token = Cookies.get("token");
        const storedUser = localStorage.getItem("user");
        
        if (!token || !storedUser) {
            router.push('/auth/login');
            return;
        }

        const user = JSON.parse(storedUser);
        fetchNotifications();

        // Listen for real-time notifications if socket is already initialized by Navbar
        const socket = getSocket('notifications') || initSocket('notifications', token, user.id);
        
        const handleNewNotification = (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
        };

        socket.on('notification', handleNewNotification);

        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, []);

    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.back()}
                            className="rounded-full hover:bg-white shadow-sm"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 font-headline uppercase italic">
                            Thông báo của bạn
                        </h1>
                    </div>
                    
                    {notifications.some(n => !n.isRead) && (
                        <Button 
                            onClick={handleMarkAllAsRead}
                            variant="outline"
                            className="rounded-full border-slate-200 bg-white hover:bg-slate-900 hover:text-white transition-all text-xs font-bold gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-slate-500 font-medium italic">Đang tải thông báo...</p>
                        </div>
                    ) : sortedNotifications.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <Bell className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Chưa có thông báo nào</h3>
                                <p className="text-slate-400 text-sm italic">Mọi thứ vẫn đang yên tĩnh. Hãy quay lại sau nhé!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {sortedNotifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif.id);
                                        if (notif.link) router.push(notif.link);
                                    }}
                                    className={cn(
                                        "group p-6 flex items-start gap-4 cursor-pointer transition-all duration-300",
                                        !notif.isRead 
                                            ? "bg-slate-50/80 hover:bg-slate-100" 
                                            : "bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                        !notif.isRead ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <h3 className={cn(
                                                "text-sm tracking-tight truncate",
                                                !notif.isRead ? "text-slate-900 font-extrabold" : "text-slate-500 font-medium"
                                            )}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded-full">
                                                <Calendar className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                                            </div>
                                        </div>
                                        
                                        <p className={cn(
                                            "text-sm leading-relaxed mb-1",
                                            !notif.isRead ? "text-slate-700 font-bold" : "text-slate-400"
                                        )}>
                                            {notif.content}
                                        </p>
                                        
                                        {!notif.isRead && (
                                            <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-tighter italic mt-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                                                Mới
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer / Tip */}
                <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                    Hệ thống thông báo thời gian thực &bull; AutoBid Hub
                </p>
            </div>
        </div>
    );
}
