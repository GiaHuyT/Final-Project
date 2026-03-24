"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VendorSidebar } from '@/components/vendor/sidebar';
import { Loader2 } from 'lucide-react';

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
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 lg:col-span-3">
                    <VendorSidebar />
                </div>
                <div className="md:col-span-9 lg:col-span-9">
                    {children}
                </div>
            </div>
        </div>
    );
}
