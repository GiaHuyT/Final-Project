"use client";

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Package,
  Gavel,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  ShieldCheck,
  Car,
  Wrench,
  MessageSquareText,
  Truck,
  ShieldAlert,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

const menuItems: any[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
  { icon: Users, label: 'Quản lý tài khoản', href: '/admin/users' },
  { icon: Car, label: 'Quản lý xe', href: '/admin/products' },
  { icon: Gavel, label: 'Quản lý đấu giá', href: '/admin/auctions' },
  { icon: ShoppingCart, label: 'Quản lý đơn hàng', href: '/admin/orders' },
  { 
    icon: Wrench, 
    label: 'Dịch vụ', 
    subItems: [
      { icon: Wrench, label: 'Dịch vụ bảo dưỡng', href: '/admin/maintenance' },
      { icon: ShieldAlert, label: 'Dịch vụ sửa chữa', href: '/admin/repairs/capacity' },
      { icon: UserCircle, label: 'Dịch vụ lái thuê', href: '/admin/driver-rental' }
    ]
  },
  { icon: MessageSquareText, label: 'Yêu cầu hỗ trợ', href: '/admin/contacts' },
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token', { path: '/' });
    Cookies.remove('user_role', { path: '/' });
    router.push('/auth/login');
  };

  const toggleSubMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out h-screen sticky top-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Admin Panel</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item, index) => {
            const hasSubItems = !!item.subItems;
            const isOpen = openMenus.includes(item.label);
            const isActive = item.href 
              ? (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
              : item.subItems?.some((si: any) => pathname.startsWith(si.href));

            if (hasSubItems) {
              return (
                <div key={index} className="flex flex-col gap-1">
                  <button
                    onClick={() => !isCollapsed && toggleSubMenu(item.label)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full group relative",
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                      </>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border shadow-sm">
                        {item.label}
                      </div>
                    )}
                  </button>
                  
                  {!isCollapsed && isOpen && (
                    <div className="flex flex-col gap-1 ml-9 mt-1 border-l pl-2">
                      {item.subItems?.map((subItem: any, siIndex: number) => (
                        <Link
                          key={siIndex}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 text-sm py-1.5 px-3 rounded-md transition-all",
                            pathname.startsWith(subItem.href)
                              ? "text-blue-600 font-bold bg-blue-50/50"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href || '#'}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all group relative",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
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

      <div className="mt-auto border-t p-4">
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
