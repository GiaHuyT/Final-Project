"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr || userStr === 'undefined') {
            console.log("Missing token or user data, redirecting to login");
            setIsAuthorized(false);
            window.location.href = '/auth/login';
            return;
        }

        try {
            const user = JSON.parse(userStr);
            console.log("Current user in AdminLayout:", user);
            if (user.role === 'ADMIN') {
                setIsAuthorized(true);
            } else {
                console.warn("User is not ADMIN. Role:", user.role);
                setIsAuthorized(false);
                window.location.href = '/auth/login';
            }
        }
        catch (error) {
            console.error("Error parsing user from localStorage:", error);
            setIsAuthorized(false);
            window.location.href = '/auth/login';
        }
    }, [router]);

    if (isAuthorized === null || isAuthorized === false) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Đang chuyển hướng...</span>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminTopbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
