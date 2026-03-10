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

export function AdminTopbar() {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <div className="flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="" alt="@admin" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Quản trị viên</p>
                                <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
                        <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Đăng xuất</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
