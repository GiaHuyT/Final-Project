"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DriverSidebar } from '@/components/driver/sidebar';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function DriverLayout({
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
            setIsAuthorized(false);
            window.location.href = '/auth/login';
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role && !user.roles) user.roles = [user.role];
            if (user.roles?.includes('DRIVER')) {
                setIsAuthorized(true);
            } else {
                console.warn("User is not DRIVER. Role:", user.roles);
                setIsAuthorized(false);
                toast.error("Bạn không có quyền truy cập khu vực Tài xế");
                window.location.href = '/';
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
            <div className="flex h-screen items-center justify-center bg-emerald-50/30">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Đang tải khu vực Tài xế...</span>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <DriverSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
