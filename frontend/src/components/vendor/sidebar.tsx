"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    Clock,
    Bell,
    Box,
    Wrench,
    Store,
    Truck,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VendorSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: "Tổng quan", href: "/vendor" },
        { icon: Store, label: "Hồ sơ nhà cung cấp", href: "/vendor/profile" },
        { icon: Box, label: "Quản lý sản phẩm", href: "/vendor/products" },
        { icon: Clock, label: "Quản lý đơn hàng", href: "/vendor/orders" },
        { icon: Truck, label: "Xe thuê", href: "/vendor/rental-cars" },
        { icon: Wrench, label: "Sửa chữa", href: "/vendor/repairs" },
        { icon: Bell, label: "Thông báo", href: "/vendor/notifications" },
        { icon: TrendingUp, label: "Báo cáo doanh thu", href: "/vendor/revenue" },
    ];

    const SidebarItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
        const active = pathname === href;
        return (
            <Link href={href}>
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'text-orange-600 bg-orange-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{label}</span>
                    {active && <span className="ml-auto text-xs">›</span>}
                </div>
            </Link>
        );
    };

    return (
        <div className="w-full md:w-64 lg:w-72 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <SidebarItem key={item.href} {...item} />
                    ))}
                </div>
            </div>

            <Button variant="outline" className="w-full bg-white border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600 h-10 p-0 overflow-hidden">
                <Link href="/profile" className="flex items-center justify-center w-full h-full gap-2">
                    <User className="w-4 h-4" />
                    Tài khoản cá nhân
                </Link>
            </Button>
        </div>
    );
}
