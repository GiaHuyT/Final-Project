"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = Cookies.get("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        window.location.reload();
    };

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo - Empty as requested */}
                <div className="font-bold text-xl w-32">
                    <Link href="/">
                        {/* Logo Placeholder */}
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/auctions" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Auctions
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Contact
                    </Link>
                </div>

                {/* Auth Buttons / User Menu */}
                <div className="hidden md:flex items-center gap-4 w-32 justify-end">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatars/01.png" alt="@user" />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">User</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            user@example.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-white">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="text-sm font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href="/auctions" className="text-sm font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                            Auctions
                        </Link>
                        <Link href="/about" className="text-sm font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                            About
                        </Link>
                        <Link href="/contact" className="text-sm font-medium hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                            Contact
                        </Link>
                        <div className="border-t pt-4 flex flex-col gap-2">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/profile">
                                        <Button variant="outline" className="w-full justify-start">Profile</Button>
                                    </Link>
                                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>Log out</Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">Login</Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full">Register</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
