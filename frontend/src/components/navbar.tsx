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

const mockNotifications = [
    { id: 1, title: 'Đấu giá kết thúc', message: 'Sản phẩm trong danh sách yêu thích của bạn đã kết thúc đấu giá', time: '10 phút trước', unread: true },
    { id: 2, title: 'Thông báo', message: 'Cập nhật chính sách thanh toán mới', time: '1 ngày trước', unread: true },
    { id: 3, title: 'Hệ thống', message: 'Tài khoản của bạn đã được bảo mật 2 lớp', time: '3 ngày trước', unread: false },
];

function NotificationBell() {
    const unreadCount = mockNotifications.filter(n => n.unread).length;
    
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
            <DropdownMenuContent className="w-80 rounded-2xl shadow-xl border-gray-100 p-0" align="end" sideOffset={10}>
                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center rounded-t-2xl">
                    <DropdownMenuLabel className="font-bold text-slate-900 p-0 font-body">Thông báo</DropdownMenuLabel>
                    {unreadCount > 0 && <span className="text-xs text-primary font-bold cursor-pointer hover:underline">Đánh dấu đã đọc</span>}
                </div>
                <DropdownMenuGroup className="max-h-[300px] overflow-y-auto w-full">
                    {mockNotifications.map((notif) => (
                        <div key={notif.id} className={cn(
                            "flex flex-col items-start gap-1 p-3 border-b border-slate-50 last:border-0 cursor-pointer transition-colors w-full outline-none",
                            notif.unread ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 opacity-75 hover:opacity-100"
                        )}>
                            <div className="flex justify-between items-start w-full gap-2 font-body">
                                <span className={cn("text-sm font-bold", notif.unread ? "text-slate-900" : "text-slate-600")}>{notif.title}</span>
                                <span className="text-[10px] font-semibold text-slate-400 shrink-0">{notif.time}</span>
                            </div>
                            <span className="text-xs text-slate-600 leading-relaxed font-body w-full whitespace-normal text-left">{notif.message}</span>
                        </div>
                    ))}
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const syncUser = () => {
            const token = Cookies.get("token");
            const storedUser = localStorage.getItem("user");
            if (token && storedUser) {
                setIsLoggedIn(true);
                setUser(JSON.parse(storedUser));
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        syncUser();

        window.addEventListener('user-updated', syncUser);
        return () => window.removeEventListener('user-updated', syncUser);
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
                    {isLoggedIn && <NotificationBell />}
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
