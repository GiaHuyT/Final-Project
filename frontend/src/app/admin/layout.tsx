"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
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
            console.log("Current user in AdminLayout:", user);
            if (user.role === 'ADMIN') {
                setIsAuthorized(true);
            } else {
                console.warn("User is not ADMIN. Role:", user.role);
                setIsAuthorized(false);
                router.push('/'); // Redirect to home if not admin
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
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return null; // Or a "Forbidden" message
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
