"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    const cancel = searchParams.get('cancel');

    const isSuccess = status === 'PAID' && cancel === 'false';

    return (
        <div className="text-center space-y-6">
            {isSuccess ? (
                <>
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-slate-900">Thanh toán thành công!</h1>
                    <p className="text-slate-600">
                        Cảm ơn bạn đã thanh toán. Mã đơn hàng của bạn là <strong>#{orderCode}</strong>.
                    </p>
                </>
            ) : (
                <>
                    <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-slate-900">Thanh toán thất bại hoặc đã hủy</h1>
                    <p className="text-slate-600">
                        Rất tiếc, giao dịch chưa được hoàn tất. Vui lòng thử lại sau.
                    </p>
                </>
            )}
            
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

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <Suspense fallback={<div className="text-center py-10">Đang xử lý kết quả thanh toán...</div>}>
                    <PaymentStatusContent />
                </Suspense>
            </div>
        </div>
    );
}
