"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/lib/http";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ArrowLeft, Check, X, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuctionRegistrationsPage() {
    const params = useParams();
    const router = useRouter();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [regRes, auctionRes] = await Promise.all([
                http.get(`/auctions/${params.id}/registrations`),
                http.get(`/auctions/${params.id}`)
            ]);
            
            setRegistrations(regRes.data);
            setAuction(auctionRes.data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đăng ký");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (regId: number, action: 'approve' | 'reject') => {
        try {
            await http.post(`/auctions/${params.id}/registrations/${regId}/${action}`);
            toast.success(action === 'approve' ? 'Đã duyệt yêu cầu!' : 'Đã từ chối yêu cầu!');
            // Reload list
            fetchData();
        } catch (error) {
            toast.error("Lỗi không thể thực hiện thao tác này");
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="bg-white border-b px-8 py-6 mb-8 flex items-center gap-4">
                <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-headline text-slate-900">Quản lý người tham gia</h1>
                    <p className="text-sm text-slate-500 mt-1">Phiên đấu giá: <span className="font-bold text-slate-700">{auction?.title}</span></p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4 rounded-tl-xl">Người đăng ký</th>
                                        <th className="px-6 py-4">Liên hệ</th>
                                        <th className="px-6 py-4">Thời gian xin</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right rounded-tr-xl">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {registrations.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <HelpCircle className="w-8 h-8 text-slate-300" />
                                                    <p>Chưa có ai đăng ký tham gia phiên này.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={reg.user.avatar || 'https://ui-avatars.com/api/?name=' + reg.user.username} 
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-800">{reg.user.username}</p>
                                                        <p className="text-xs text-slate-500">ID: #{reg.userId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-600">{reg.user.email || 'Chưa cung cấp email'}</p>
                                                <p className="text-slate-600">{reg.user.phonenumber || 'Chưa cung cấp số ĐT'}</p>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600">
                                                {format(new Date(reg.createdAt), 'HH:mm dd/MM/yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reg.status === 'PENDING' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none"><Clock className="w-3 h-3 mr-1"/> Đang chờ duyệt</Badge>}
                                                {reg.status === 'APPROVED' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"><Check className="w-3 h-3 mr-1"/> Đã duyệt</Badge>}
                                                {reg.status === 'REJECTED' && <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none"><X className="w-3 h-3 mr-1"/> Đã từ chối</Badge>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {reg.status === 'PENDING' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button onClick={() => handleAction(reg.id, 'approve')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-none h-8 px-3">
                                                            <Check className="w-4 h-4 mr-1"/> Duyệt
                                                        </Button>
                                                        <Button onClick={() => handleAction(reg.id, 'reject')} size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 h-8 px-3">
                                                            <X className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                )}
                                                {reg.status !== 'PENDING' && (
                                                    <span className="text-xs text-slate-400 italic">Đã xử lý</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
