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
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
  { 
    icon: ShieldCheck, 
    label: 'Phê duyệt', 
    subItems: [
      { label: 'Tài khoản', href: '/admin/approvals/users' },
      { label: 'Sản phẩm', href: '/admin/approvals/products' },
      { label: 'Đấu giá', href: '/admin/approvals/auctions' },
    ]
  },
  { icon: Users, label: 'Người dùng', href: '/admin/users' },
  { icon: Package, label: 'Sản phẩm', href: '/admin/products' },
  { icon: Gavel, label: 'Đấu giá', href: '/admin/auctions' },
  { icon: ShoppingCart, label: 'Đơn hàng', href: '/admin/orders' },
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
    Cookies.remove('token');
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
            const isActive = item.href ? pathname === item.href : item.subItems?.some(si => pathname === si.href);

            if (hasSubItems) {
              return (
                <div key={index} className="flex flex-col gap-1">
                  <button
                    onClick={() => !isCollapsed && toggleSubMenu(item.label)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent w-full",
                      isActive && "text-primary bg-accent",
                      "group relative"
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
                      {item.subItems?.map((subItem, siIndex) => (
                        <Link
                          key={siIndex}
                          href={subItem.href}
                          className={cn(
                            "text-sm py-1.5 px-3 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all",
                            pathname === subItem.href && "text-primary font-medium bg-accent/50"
                          )}
                        >
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                  pathname === item.href && "text-primary bg-accent",
                  "group relative"
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
