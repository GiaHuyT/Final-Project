"use client";

import React from 'react';
import { Bell, Search, User, Store, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import http from '@/lib/http';

export function VendorTopbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const syncUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        };

        const fetchUnreadCount = async () => {
            try {
                const res = await http.get('/notifications/unread-count');
                setUnreadCount(res.data || 0);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        syncUser();
        
        const token = Cookies.get('token');
        if (token) {
            fetchUnreadCount();
        }

        window.addEventListener('user-updated', syncUser);
        window.addEventListener('notifications-updated', fetchUnreadCount);
        return () => {
            window.removeEventListener('user-updated', syncUser);
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

    return (
        <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-6 shadow-sm">
            <div className="flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                        className="w-full bg-slate-50 pl-9 md:w-[300px] lg:w-[400px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-10"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={() => router.push('/vendor/notifications')} variant="ghost" size="icon" className="relative group hover:bg-slate-50 rounded-xl h-10 w-10">
                    <Bell className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-blue-100 p-0 overflow-hidden hover:border-blue-300 transition-colors">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.avatar || ""} alt={`@${user?.username || 'vendor'}`} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                                    {user?.username?.[0]?.toUpperCase() || "V"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1 p-1">
                                <p className="text-[15px] font-bold leading-none text-slate-900 line-clamp-1">{user?.username || "Nhà cung cấp"}</p>
                                <p className="text-xs leading-none text-slate-500 mt-1 line-clamp-1">{user?.email || "vendor@example.com"}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/vendor/profile')} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 p-2">
                            <Store className="h-4 w-4 text-slate-400" /> Hồ sơ gian hàng
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile')} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 p-2">
                            <User className="h-4 w-4 text-slate-400" /> Về trang cá nhân
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2 cursor-pointer font-bold p-2" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" /> Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
