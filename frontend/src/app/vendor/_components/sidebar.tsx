"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Store,
    Box,
    Clock,
    Truck,
    Wrench,
    Bell,
    TrendingUp,
    LogOut,
    ChevronLeft,
    Menu,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const menuItems = [
    { icon: Store, label: 'Hồ sơ nhà cung cấp', href: '/vendor/profile' },
    { icon: Box, label: 'Quản lý sản phẩm', href: '/vendor/products' },
    { icon: Clock, label: 'Quản lý đơn hàng', href: '/vendor/orders' },
    { icon: Truck, label: 'Xe thuê', href: '/vendor/rental-cars' },
    { icon: Wrench, label: 'Sửa chữa', href: '/vendor/repairs' },
    { icon: Bell, label: 'Thông báo', href: '/vendor/notifications' },
    { icon: TrendingUp, label: 'Doanh thu', href: '/vendor/revenue' },
];

export function VendorSidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        router.push('/auth/login');
    };

    return (
        <div className={cn(
            "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!isCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Vendor Panel</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 text-gray-500"
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all group relative",
                                    isActive 
                                        ? "bg-orange-50 text-orange-600 font-medium" 
                                        : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50/50"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-orange-600" : "text-gray-500 group-hover:text-orange-600")} />
                                {!isCollapsed && <span>{item.label}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border shadow-sm">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto border-t p-4 space-y-2">
                <Button variant="ghost" asChild className={cn(
                    "w-full justify-start gap-3 text-muted-foreground hover:text-orange-600 hover:bg-orange-50",
                    isCollapsed && "px-2"
                )}>
                    <Link href="/profile">
                        <User className="h-5 w-5" />
                        {!isCollapsed && <span>Cá nhân</span>}
                    </Link>
                </Button>
                <Button variant="ghost" className={cn(
                    "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                    isCollapsed && "px-2"
                )} onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Đăng xuất</span>}
                </Button>
            </div>
        </div>
    );
}
