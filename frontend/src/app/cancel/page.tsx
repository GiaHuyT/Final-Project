"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect } from 'react';
import http from '@/lib/http';

function CancelPaymentContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        if (orderCode) {
            http.post(`/payos/cancel/${orderCode}`).catch(err => {
                console.error("Failed to cancel payment on backend", err);
            });
        }
    }, [orderCode]);

    return (
        <div className="text-center space-y-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900">Thanh toán đã bị hủy</h1>
            <p className="text-slate-600">
                Giao dịch {orderCode ? `mã #${orderCode}` : ''} đã bị hủy bỏ và chưa được trừ tiền.
            </p>
            
            <div className="pt-4">
                <Link href="/">
                    <Button className="w-full bg-slate-900 hover:bg-black text-white h-12 font-bold">
                        Về trang chủ
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
                    <CancelPaymentContent />
                </Suspense>
            </div>
        </div>
    );
}
