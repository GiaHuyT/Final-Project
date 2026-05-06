"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, FileText, Calendar, Car, AlertCircle, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useState } from 'react';
import http from '@/lib/http';

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    const cancel = searchParams.get('cancel');

    const isSuccess = status === 'PAID' && cancel === 'false';
    const [loading, setLoading] = useState(isSuccess);
    const [transaction, setTransaction] = useState<any>(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (isSuccess && orderCode) {
                try {
                    const { data } = await http.get(`/transactions/${orderCode}`);
                    setTransaction(data);
                } catch (error) {
                    console.error("Failed to fetch transaction details", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchTransaction();
    }, [isSuccess, orderCode]);

    if (!isSuccess) {
        return (
            <div className="text-center space-y-6">
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-slate-900">Thanh toán thất bại hoặc đã hủy</h1>
                <p className="text-slate-600">
                    Rất tiếc, giao dịch chưa được hoàn tất. Vui lòng thử lại sau.
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-on-surface-variant font-medium">Đang khởi tạo phiếu cọc...</p>
            </div>
        );
    }

    const order = transaction?.order;
    const item = order?.items?.[0];
    const product = item?.product;
    const customer = order?.customer;

    return (
        <div className="text-center space-y-6">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-headline">Thanh toán thành công!</h1>
            
            <div className="bg-surface-container-low border border-outline/20 rounded-3xl p-6 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline/10 text-on-surface">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-none">PHIẾU ĐẶT CỌC XE</h2>
                        <p className="text-xs text-on-surface-variant mt-1">Mã GD: #{orderCode}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {product && (
                        <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-outline/5">
                            <div className="flex items-center gap-3 text-on-surface">
                                <Car className="w-5 h-5 text-on-surface-variant" />
                                <span className="text-sm font-medium">Sản phẩm cọc:</span>
                            </div>
                            <span className="font-bold text-right truncate max-w-[150px]" title={product.name}>{product.name}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-outline/5">
                        <div className="flex items-center gap-3 text-on-surface">
                            <span className="font-medium text-lg">Số tiền đã cọc:</span>
                        </div>
                        <span className="font-black text-xl text-primary">{transaction?.amount?.toLocaleString('vi-VN')} ₫</span>
                    </div>

                    <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-outline/5">
                        <div className="flex items-center gap-3 text-on-surface">
                            <Calendar className="w-5 h-5 text-on-surface-variant" />
                            <span className="text-sm font-medium">Thời gian giao dịch:</span>
                        </div>
                        <span className="font-bold text-sm">{new Date(transaction?.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
                    </div>

                    {customer && (
                        <div className="bg-surface p-4 rounded-2xl border border-outline/5 space-y-3">
                            <div className="flex items-center gap-3 text-on-surface mb-2">
                                <User className="w-5 h-5 text-on-surface-variant" />
                                <span className="text-sm font-medium">Thông tin người cọc:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm pl-8">
                                <div className="text-on-surface-variant">Họ và tên:</div>
                                <div className="font-bold text-right">{customer.username}</div>
                                
                                {customer.phonenumber && (
                                    <>
                                        <div className="text-on-surface-variant">Số điện thoại:</div>
                                        <div className="font-bold text-right">{customer.phonenumber}</div>
                                    </>
                                )}
                                
                                {customer.email && (
                                    <>
                                        <div className="text-on-surface-variant">Email:</div>
                                        <div className="font-bold text-right truncate" title={customer.email}>{customer.email}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-1">LƯU Ý QUAN TRỌNG</p>
                        <p className="text-xs text-orange-700 leading-relaxed font-medium">
                            Hệ thống chỉ giữ xe trong vòng <span className="font-bold">7 ngày</span> kể từ ngày đặt cọc. Quá 7 ngày, xe sẽ tự động được mở bán lại trạng thái bình thường. Tiền cọc có thể không được hoàn lại tùy theo quy định của người bán. Vui lòng liên hệ showroom sớm nhất để hoàn tất thủ tục.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="pt-4 flex gap-4">
                <Link href="/" className="flex-1">
                    <Button className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface h-12 font-bold rounded-xl transition-colors border border-outline/10">
                        Về trang chủ
                    </Button>
                </Link>
                {product && (
                    <Link href={`/products/${product.id}`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-on-primary h-12 font-bold rounded-xl transition-colors">
                            Xem lại xe
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-surface rounded-[2.5rem] shadow-xl border border-outline/10 p-8 md:p-10">
                <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
                    <PaymentStatusContent />
                </Suspense>
            </div>
        </div>
    );
}
