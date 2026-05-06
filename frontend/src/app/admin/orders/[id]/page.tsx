"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminInvoiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await http.get(`/orders/${params.id}`);
                setOrder(response.data);
            } catch (error) {
                toast.error("Không thể tải chi tiết hóa đơn");
                router.push('/admin/orders');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchOrder();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Quay lại Danh sách hóa đơn
            </Link>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                    <ShoppingCart className="w-12 h-12 mb-6 relative z-10 opacity-90 text-blue-300" />
                    <h1 className="text-4xl font-black mb-3 relative z-10 text-white tracking-tight">Chi tiết Hóa đơn #{order.id}</h1>
                    <p className="text-blue-100 font-medium relative z-10 text-lg">
                        Khách hàng: <span className="font-bold text-white">{order.customer?.username || 'Khách vãng lai / Hệ thống'}</span>
                    </p>
                </div>
                
                <div className="p-10 bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Danh sách sản phẩm</h3>
                    <div className="space-y-6">
                        {order.items?.map((item: any) => (
                            <div key={item.product?.id || Math.random()} className="flex gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-32 h-32 shrink-0 rounded-2xl bg-gray-200 overflow-hidden shadow-inner">
                                    <img src={item.product?.imageUrl || '/images/static/car-placeholder.png'} alt={item.product?.name || 'Sản phẩm'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-between py-2 flex-1">
                                    <div>
                                        <h4 className="font-black text-xl text-gray-900 line-clamp-2 mb-2">{item.product?.name || 'Sản phẩm không xác định'}</h4>
                                        <p className="text-sm font-medium text-gray-500">Đối tác phân phối: <span className="font-bold text-gray-700">{item.product?.vendor?.username || 'Hệ thống'}</span></p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/60">
                                        <span className="text-sm font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-lg uppercase tracking-widest">Số lượng: {item.quantity || 1}</span>
                                        <span className="font-black text-2xl text-blue-600">
                                            {item.product?.price?.toLocaleString('vi-VN') || (order.totalPrice).toLocaleString('vi-VN')} <span className="text-sm font-bold text-blue-400 uppercase">VNĐ</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className="border-t-2 border-dashed border-gray-200 pt-8 mt-8">
                            <div className="flex justify-between items-center bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8">
                                <span className="font-black text-gray-500 uppercase tracking-widest text-sm">Tổng giá trị hóa đơn</span>
                                <span className="text-4xl font-black text-blue-700 tracking-tighter">
                                    {order.totalPrice.toLocaleString('vi-VN')} <span className="text-xl text-blue-400">VNĐ</span>
                                </span>
                            </div>
                            
                            <div className="flex justify-end gap-4">
                                <Button 
                                    onClick={() => window.print()}
                                    className="h-14 px-10 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-gray-900/20 transition-all gap-3 text-sm"
                                >
                                    In Hóa Đơn / Xuất PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
