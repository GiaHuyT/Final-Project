"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    ChevronRight, 
    User, 
    MapPin, 
    Activity, 
    Calendar, 
    Bell, 
    Briefcase, 
    ClipboardList,
    Settings,
    LogOut,
    Menu,
    HelpCircle,
    Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import http from '@/lib/http';

const menuItems = [
    { label: 'Hồ sơ tài xế', href: '/driver/profile', icon: User, hasNotification: false },
    { label: 'Tìm kiếm cuốc xe', href: '/driver/find-rides', icon: Navigation, hasNotification: false },
    { label: 'Lịch làm việc', href: '/driver/schedule', icon: Calendar, hasNotification: false },
    { label: 'Hiệu suất hoạt động', href: '/driver', icon: Activity, hasNotification: false },
    { label: 'Thông báo', href: '/driver/notifications', icon: Bell, hasNotification: true },
    { label: 'Báo cáo thu nhập', href: '/driver/earnings', icon: Briefcase, hasNotification: false },
    { label: 'Lịch sử cuốc xe', href: '/driver/history', icon: ClipboardList, hasNotification: false },
    { label: 'Trung tâm Trợ giúp', href: '/driver/help', icon: HelpCircle, hasNotification: false },
];

export function DriverSidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isActive, setIsActive] = useState(true);
    const [autoAccept, setAutoAccept] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loadUser = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    let parsedUser = JSON.parse(userStr);
                    setUser(parsedUser);
                    
                    // Lấy profile thực tế để lấy ảnh chân dung tài xế nếu cần
                    const { data: profileData } = await http.get('/users/profile');
                    const driverService = profileData.serviceProfiles?.driverRentalServices?.[0];
                    const displayAvatar = profileData.avatar || driverService?.avatarUrl || null;
                    
                    if (displayAvatar !== parsedUser.avatar) {
                        parsedUser.avatar = displayAvatar;
                        setUser({ ...parsedUser });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };

        loadUser();

        const handleUserUpdate = () => {
            loadUser();
        };

        window.addEventListener('user-updated', handleUserUpdate);
        return () => {
            window.removeEventListener('user-updated', handleUserUpdate);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        router.push('/auth/login');
    };

    // To handle the active styling for "Hiệu suất hoạt động" which might map to the base "/driver" route right now.
    const isRouteActive = (href: string) => {
        if (href === '/driver/hub' && pathname === '/driver') return true;
        return pathname === href;
    };

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
                        <AvatarImage src={user?.avatar || ""} alt={user?.username || 'Driver'} className="object-cover" />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl font-bold">
                            {user?.username?.[0]?.toUpperCase() || "H"}
                        </AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute bottom-2 right-2 h-6 w-6 border-4 border-white rounded-full shadow-sm transition-colors", isActive ? "bg-emerald-500" : "bg-slate-300")}></div>
                </div>
                {!isCollapsed && (
                    <h2 className="text-[18px] font-bold text-slate-800 uppercase tracking-wide mt-4">
                        {user?.username || "HUY"}
                    </h2>
                )}
            </div>

            {/* Operating Status Toggles */}
            <div className={cn("mb-6 px-6 py-2 space-y-5", isCollapsed ? "hidden" : "block")}>
                <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-slate-700">Trạng thái hoạt động</span>
                    <Switch 
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
            </div>

            <div className="w-full h-px bg-slate-100 mb-2"></div>

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
                                        ? "bg-emerald-50/80 text-emerald-600" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center w-6 h-6">
                                        <item.icon className={cn("w-5 h-5", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={active ? 2.5 : 2} />
                                        {item.hasNotification && (
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
                                        active ? "text-emerald-600" : "text-slate-300 group-hover:text-slate-400"
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
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-all group text-emerald-600 hover:bg-emerald-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                        </div>
                        {!isCollapsed && <span className="text-[15px] font-bold">Về trang cá nhân</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-300" />}
                </Link>

                <Link
                    href="/driver/settings"
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
