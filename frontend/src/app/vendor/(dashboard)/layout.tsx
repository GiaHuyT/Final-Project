"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorSidebar } from '@/components/vendor/sidebar';
import { VendorTopbar } from '@/components/vendor/topbar';
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
            if (user.role === 'VENDOR') {
                setIsAuthorized(true);
            } else {
                console.warn("User is not VENDOR. Role:", user.role);
                setIsAuthorized(false);
                toast.error("Bạn không có quyền truy cập khu vực Nhà cung cấp");
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
            <div className="flex h-screen items-center justify-center bg-gray-50/30">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Đang chuyển hướng...</span>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/30">
            <VendorSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <VendorTopbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
