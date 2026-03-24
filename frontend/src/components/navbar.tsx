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
} from "@/components/ui/dropdown-menu";


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
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none ring-2 ring-primary/20 flex items-center justify-center bg-primary text-on-primary font-bold text-sm cursor-pointer hover:scale-105 transition-transform select-none">
                                {user?.username?.[0]?.toUpperCase() || "U"}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
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
