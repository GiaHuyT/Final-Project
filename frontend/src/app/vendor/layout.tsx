"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorSidebar } from './_components/sidebar';
import { VendorTopbar } from './_components/topbar';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setIsAuthorized(false);
            router.push('/auth/login');
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
                router.push('/');
            }
        }
        catch (error) {
            console.error("Error parsing user from localStorage:", error);
            setIsAuthorized(false);
            router.push('/auth/login');
        }
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/30">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return null;
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
