"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Bell, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

import http from "@/lib/http";
import { initSocket, disconnectSocket } from "@/lib/socket";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

function NotificationBell({ 
    notifications, 
    unreadCount, 
    onMarkAsRead, 
    onMarkAllAsRead 
}: { 
    notifications: Notification[], 
    unreadCount: number,
    onMarkAsRead: (id: number) => void,
    onMarkAllAsRead: () => void
}) {
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none flex items-center justify-center text-slate-600 hover:text-primary transition-colors hover:bg-slate-100 cursor-pointer">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 rounded-2xl shadow-xl border-gray-100 p-0 bg-white" align="end" sideOffset={10}>
                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center rounded-t-2xl">
                    <DropdownMenuLabel className="font-bold text-slate-900 p-0 font-body text-sm">Thông báo</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <span 
                            onClick={(e) => { e.preventDefault(); onMarkAllAsRead(); }}
                            className="text-[10px] text-primary font-bold cursor-pointer hover:underline uppercase tracking-tight"
                        >
                            Đánh dấu đã đọc
                        </span>
                    )}
                </div>
                <DropdownMenuGroup className="max-h-[350px] overflow-y-auto w-full">
                    {sortedNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-body italic">
                            Chưa có thông báo nào
                        </div>
                    ) : (
                        sortedNotifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                onClick={() => !notif.isRead && onMarkAsRead(notif.id)}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 border-b border-slate-50 last:border-0 cursor-pointer transition-colors w-full outline-none",
                                    !notif.isRead ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 opacity-75 hover:opacity-100"
                                )}
                            >
                                <div className="flex justify-between items-start w-full gap-2 font-body">
                                    <span className={cn("text-sm font-bold", !notif.isRead ? "text-slate-900" : "text-slate-600")}>
                                        {notif.title}
                                    </span>
                                    <span className="text-[9px] font-semibold text-slate-400 shrink-0 uppercase">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-600 leading-relaxed font-body w-full whitespace-normal text-left line-clamp-2">
                                    {notif.content}
                                </span>
                                {notif.link && (
                                    <Link 
                                        href={notif.link} 
                                        className="text-[10px] text-blue-600 font-bold hover:underline mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Xem chi tiết →
                                    </Link>
                                )}
                            </div>
                        ))
                    )}
                </DropdownMenuGroup>
                <div className="p-2 bg-white rounded-b-2xl border-t">
                    <button className="w-full text-xs font-bold text-primary hover:text-primary/80 py-1.5 text-center transition-colors">Xem tất cả</button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const fetchNotifications = async () => {
        try {
            const { data } = await http.get('/notifications');
            setNotifications(data);
            const unread = data.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await http.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await http.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    useEffect(() => {
        const syncUser = () => {
            const token = Cookies.get("token");
            const storedUser = localStorage.getItem("user");
            if (token && storedUser) {
                const userData = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUser(userData);

                // Initial fetch
                fetchNotifications();

                // Setup Socket
                const socket = initSocket(token, userData.id);
                socket.on('notification', (newNotif: Notification) => {
                    console.log("New real-time notification:", newNotif);
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            } else {
                setIsLoggedIn(false);
                setUser(null);
                setNotifications([]);
                setUnreadCount(0);
                disconnectSocket();
            }
        };

        syncUser();

        window.addEventListener('user-updated', syncUser);
        return () => {
            window.removeEventListener('user-updated', syncUser);
            disconnectSocket();
        };
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("user_role");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        disconnectSocket();
        window.location.reload();
    };

    if (pathname?.startsWith('/auth')) {
        return null;
    }

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="flex justify-between items-center h-16 px-6 lg:px-12 max-w-screen-2xl mx-auto">
                <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 font-headline">AutoBid</Link>
                <div className="hidden md:flex items-center space-x-8 tracking-tight font-semibold text-sm">
                    <Link className="text-slate-600 hover:text-slate-900 transition-colors" href="/auctions">Đấu giá</Link>
                    <Link className="text-slate-600 hover:text-slate-900 transition-colors" href="/categories">Các mẫu xe</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {isLoggedIn && (
                        <Link 
                            href="/wishlist" 
                            className="relative h-8 w-8 rounded-full outline-none flex items-center justify-center text-slate-600 hover:text-primary transition-colors hover:bg-slate-100 cursor-pointer"
                            title="Yêu thích"
                        >
                            <Heart className="h-5 w-5" />
                        </Link>
                    )}
                    {isLoggedIn && (
                        <NotificationBell 
                            notifications={notifications} 
                            unreadCount={unreadCount} 
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                        />
                    )}
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none ring-2 ring-primary/20 flex items-center justify-center bg-primary text-on-primary font-bold text-sm cursor-pointer hover:scale-105 transition-transform select-none">
                                {user?.username?.[0]?.toUpperCase() || "U"}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-white shadow-xl border border-gray-100" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal font-body">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">{user?.username || "Người dùng"}</p>
                                        <p className="text-xs leading-none text-slate-500">
                                            {user?.email || "user@example.com"}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer font-semibold text-sm font-body">Hồ sơ</Link>
                                </DropdownMenuItem>
                                {user?.role === 'VENDOR' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/vendor/products" className="cursor-pointer font-semibold text-sm font-body">Cửa hàng</Link>
                                    </DropdownMenuItem>
                                )}
                                {user?.role === 'ADMIN' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/products" className="cursor-pointer font-semibold text-sm font-body">Quản trị</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleLogout} className="text-error font-bold text-sm cursor-pointer mt-2 font-body">
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors font-body">Đăng nhập</Link>
                            <Link href="/auth/register" className="bg-primary text-on-primary px-5 py-2 rounded-full font-headline font-bold text-xs tracking-widest uppercase hover:bg-slate-800 transition-colors">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
