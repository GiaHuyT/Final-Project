"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorSidebar } from '@/components/vendor/sidebar';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function VendorLayout({
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
            if (user.roles?.includes('VENDOR')) {
                setIsAuthorized(true);
            } else {
                console.warn("User is not VENDOR. Role:", user.role);
                setIsAuthorized(false);
                toast.error("Bạn không có quyền truy cập khu vực Nhà cung cấp");
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
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Đang chuyển hướng...</span>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <VendorSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
