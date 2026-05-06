"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Gavel, ArrowLeft, Car, Calendar, ExternalLink, Store } from "lucide-react";
import { format } from "date-fns";

export default function AuctionHistoryPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await http.get('/auctions/customer/me');
                setRegistrations(res.data || []);
            } catch (error) {
                console.error("Error fetching auction history:", error);
                toast.error("Không thể tải lịch sử đấu giá");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Đã duyệt</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">Từ chối</span>;
            case 'PENDING':
            default:
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Chờ duyệt</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 group font-bold text-sm tracking-tight">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại Gara
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">Lịch sử đấu giá</h1>
                        <p className="text-slate-500 font-medium text-lg">Quản lý các phiên đấu giá bạn đã đăng ký tham gia.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Đã đăng ký</p>
                            <p className="text-xl font-black text-slate-900">{registrations.length} phiên</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Gavel className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {registrations.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-20 text-center bg-white shadow-sm min-h-[500px]">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                                <Gavel className="w-10 h-10 text-slate-200" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Chưa tham gia đấu giá nào</h3>
                        <p className="text-base font-medium text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Khám phá ngay các phiên đấu giá siêu xe đang diễn ra để mang về chiếc xe mơ ước với giá tốt nhất.</p>
                        <Link href="/auctions" className="px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20">
                            Khám phá Đấu giá
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                {reg.status === 'APPROVED' && reg.auction.status === 'ACTIVE' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                )}
                                
                                <div className="flex justify-between items-start z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Gavel className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 line-clamp-1">{reg.auction.title}</h3>
                                            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <Store className="w-3.5 h-3.5" />
                                                {reg.auction.vendor?.username}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(reg.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-2 z-10">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mức giá khởi điểm</div>
                                        <div className="font-bold text-slate-800">{reg.auction.startPrice?.toLocaleString('vi-VN')} đ</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Thời gian diễn ra</div>
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {format(new Date(reg.auction.startTime), "dd/MM")} - {format(new Date(reg.auction.endTime), "dd/MM")}
                                        </div>
                                    </div>
                                </div>

                                {reg.auction.items && reg.auction.items.length > 0 && (
                                    <div className="mt-1 space-y-2 z-10">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách xe</div>
                                        {reg.auction.items.slice(0, 2).map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                                                <img 
                                                    src={item.product?.images?.[0]?.url || "/images/static/car-placeholder.png"} 
                                                    alt={item.product?.name}
                                                    className="w-12 h-12 rounded-md object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{item.product?.name}</p>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Giá báo: {item.startPrice?.toLocaleString('vi-VN')} đ
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {reg.auction.items.length > 2 && (
                                            <div className="text-xs font-bold text-slate-400 text-center">+ {reg.auction.items.length - 2} chiếc khác</div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between z-10">
                                    <div className="text-xs font-bold text-slate-500">
                                        Ngày đăng ký: {format(new Date(reg.createdAt), "dd/MM/yyyy")}
                                    </div>
                                    
                                    {reg.status === 'APPROVED' ? (
                                        <Link href={`/auctions/${reg.auctionId}`} className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                                            Vào phòng <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button disabled className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-lg cursor-not-allowed">
                                            Chưa thể vào
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
