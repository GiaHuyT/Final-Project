"use client";

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
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

export function VendorTopbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

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

        syncUser();

        window.addEventListener('user-updated', syncUser);
        return () => window.removeEventListener('user-updated', syncUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        router.push('/auth/login');
    };

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <div className="flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px] border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-gray-500 group-hover:text-orange-600" />
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-orange-600"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-gray-100 p-0 overflow-hidden">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.avatar || ""} alt={`@${user?.username || 'vendor'}`} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                    {user?.username?.[0]?.toUpperCase() || 'V'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.username || "Nhà cung cấp"}</p>
                                <p className="text-xs leading-none text-muted-foreground italic">{user?.email || "vendor@example.com"}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/vendor/profile')}>
                            Hồ sơ nhà cung cấp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                            Tài khoản cá nhân
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
