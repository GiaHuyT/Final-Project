"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    Box,
    Wrench,
    Bell,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    User,
    Settings,
    Package,
    Car,
    Gavel,
    Wallet,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import http from '@/lib/http';

const menuItems = [
    { icon: Store, label: 'Hồ sơ nhà cung cấp', href: '/vendor/profile' },
    { icon: Box, label: 'Quản lý xe', href: '/vendor/products' },
    { icon: Package, label: 'Quản lý đơn hàng', href: '/vendor/orders' },
    { icon: Gavel, label: 'Quản lý đấu giá', href: '/vendor/auctions' },
    { icon: Wallet, label: 'Doanh thu', href: '/vendor/revenue' },
    { icon: Bell, label: 'Thông báo', href: '/vendor/notifications', hasNotification: true },
    { icon: HelpCircle, label: 'Trung tâm trợ giúp', href: '/vendor/help' },
];

export function VendorSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined') {
                try {
                    const parsedUser = JSON.parse(userStr);
                    setUser(parsedUser);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        loadUser();

        const fetchUnreadCount = async () => {
            try {
                const res = await http.get('/notifications/unread-count');
                setUnreadCount(res.data || 0);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        const token = Cookies.get('token');
        if (token) {
            fetchUnreadCount();
        }

        const handleUserUpdate = () => loadUser();
        window.addEventListener('user-updated', handleUserUpdate);
        window.addEventListener('notifications-updated', fetchUnreadCount);
        return () => {
            window.removeEventListener('user-updated', handleUserUpdate);
            window.removeEventListener('notifications-updated', fetchUnreadCount);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token', { path: '/' });
        Cookies.remove('user_role', { path: '/' });
        router.push('/auth/login');
    };

    const isRouteActive = (href: string) => pathname === href;

    return (
        <div className={cn(
            "relative flex flex-col border-r border-slate-100 bg-white transition-all duration-300 ease-in-out h-screen sticky top-0 shrink-0",
            isCollapsed ? "w-20" : "w-[320px]"
        )}>
            {/* Collapse Toggle for Mobile/Tablet */}
            <div className="absolute -right-3 top-6 hidden md:flex">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-6 w-6 rounded-full border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                >
                    <ChevronRight className={cn("h-3 w-3 transition-transform", isCollapsed ? "" : "rotate-180")} />
                </Button>
            </div>

            {/* Profile Section */}
            <div className={cn("flex flex-col items-center pt-8 pb-4 transition-all", isCollapsed ? "px-2" : "px-4")}>
                <div className="relative">
                    <Avatar className={cn("border-4 border-white shadow-md transition-all", isCollapsed ? "h-14 w-14" : "h-32 w-32")}>
                        <AvatarImage src={user?.avatar || ""} alt={user?.username || 'Vendor'} className="object-cover" />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-3xl font-bold">
                            {user?.username?.[0]?.toUpperCase() || "V"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                {!isCollapsed && (
                    <h2 className="text-[18px] font-bold text-slate-800 uppercase tracking-wide mt-4 text-center px-4 line-clamp-1">
                        {user?.username || "VENDOR"}
                    </h2>
                )}
            </div>

            <div className="w-full h-px bg-slate-100 mb-2 mt-4"></div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                <nav className="grid gap-1 px-4">
                    {menuItems.map((item, index) => {
                        const active = isRouteActive(item.href);
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between rounded-xl px-4 py-3.5 transition-all group relative",
                                    active 
                                        ? "bg-blue-50 text-blue-600" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center w-6 h-6">
                                        <item.icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={active ? 2.5 : 2} />
                                        {item.hasNotification && unreadCount > 0 && (
                                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <span className={cn(
                                            "text-[15px]",
                                            active ? "font-bold" : "font-medium"
                                        )}>
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                                
                                {!isCollapsed && (
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-colors",
                                        active ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"
                                    )} />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="w-full h-px bg-slate-100 mt-2"></div>

            {/* Bottom Actions */}
            <div className="mt-auto py-4 px-4 space-y-1 border-t border-slate-100">
                <Link
                    href="/profile"
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-all group text-blue-600 hover:bg-blue-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                        </div>
                        {!isCollapsed && <span className="text-[15px] font-bold">Về trang cá nhân</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-300" />}
                </Link>

                <Link
                    href="/vendor/settings"
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-all group text-slate-600 hover:bg-slate-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600" strokeWidth={2} />
                        </div>
                        {!isCollapsed && <span className="text-[15px] font-medium">Cài đặt</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />}
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all group text-red-600 hover:bg-red-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                            <span className="text-white text-[12px] font-bold">N</span>
                        </div>
                        {!isCollapsed && <span className="text-[15px] font-bold">Đăng xuất</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-300" />}
                </button>
            </div>
        </div>
    );
}
