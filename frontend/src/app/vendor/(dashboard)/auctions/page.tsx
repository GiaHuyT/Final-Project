"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Gavel, Calendar, Edit, Eye, Clock, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import http from '@/lib/http';
import AuctionRegistrationsModal from '@/components/auctions/AuctionRegistrationsModal';

function AuctionCountdown({ startTime, status }: { startTime: string; status: string }) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const startMs = new Date(startTime).getTime();
        if (status !== 'ACTIVE' && status !== 'PENDING') return;
        if (status === 'ACTIVE' && startMs <= new Date().getTime()) return;

        const tick = () => {
            const now = new Date().getTime();
            const startMs = new Date(startTime).getTime();
            const distance = startMs - now;

            if (distance <= 0) {
                setTimeLeft('Đang mở...');
            } else {
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`Mở sau: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [startTime, status]);

    if (!timeLeft) return null;
    if (status !== 'PENDING' && status !== 'ACTIVE') return null;

    return (
        <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md ml-auto">
            {timeLeft}
        </span>
    );
}

export default function VendorAuctionsPage() {
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
    const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('ALL');

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            let data = [];
            try {
                const res = await http.get('/auctions/vendor/me');
                if (res.data && Array.isArray(res.data)) {
                    data = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                }
            } catch (err) {
                // Fallback to fetch all if backend endpoint not registered yet
                const res = await http.get('/auctions');
                data = res.data || [];
            }
            
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            // If data contains all auctions, filter it manually as fallback
            if (data && Array.isArray(data)) {
                // If the first item belongs to another vendor, or we suspect it's all auctions
                // Safe check: filter if vendorId is present
                const myAuctions = data.filter((a: any) => a.vendorId === userObj.id || a.vendor?.id === userObj.id || String(a.vendorId) === String(userObj.id));
                // If it's from vendor/me, it might already be filtered. But filtering again is safe.
                setAuctions(myAuctions.length > 0 ? myAuctions : data.filter((a: any) => String(a.vendorId) === String(userObj.id)));
            }
        } catch (error) {
            console.error("Error fetching auctions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const openRegistrationsModal = (id: number) => {
        setSelectedAuctionId(id);
        setIsRegistrationsModalOpen(true);
    };

    const getStatusBadge = (status: string, startTime?: string) => {
        if (status === 'ACTIVE' && startTime && new Date(startTime).getTime() > new Date().getTime()) {
            return <Badge variant="outline" className="bg-amber-100 text-amber-700">Sắp diễn ra</Badge>;
        }
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="bg-amber-100 text-amber-700">Sắp diễn ra</Badge>;
            case 'ACTIVE': return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Đang diễn ra</Badge>;
            case 'WAITING_PAYMENT': return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="w-3 h-3 mr-1" />Chờ cọc</Badge>;
            case 'COMPLETED': return <Badge variant="secondary" className="bg-sky-100 text-sky-700">Thành công</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Đã hủy</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredAuctions = auctions.filter((auction) => {
        if (filter === 'ONLINE') return auction.type === 'LIVESTREAM';
        if (filter === 'OFFLINE') return auction.type === 'OFFLINE';
        if (filter === 'EXPIRED') return auction.status === 'COMPLETED' || auction.status === 'FINISHED' || auction.status === 'ENDED';
        if (filter === 'CANCELLED') return auction.status === 'CANCELLED';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-blue-600" />
                        Quản lý Đấu giá
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Tạo và theo dõi các phiên đấu giá của bạn</p>
                </div>
                <Link href="/vendor/auctions/create">
                    <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 shadow-sm shadow-blue-100 gap-2 transition-all font-bold">
                        <Plus className="w-4 h-4" />
                        Tạo phiên đấu giá
                    </Button>
                </Link>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto">
                <Button variant={filter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'bg-blue-600' : ''}>Tất cả</Button>
                <Button variant={filter === 'ONLINE' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ONLINE')} className={filter === 'ONLINE' ? 'bg-rose-500 hover:bg-rose-600 border-rose-500' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}>🔴 Online (Live)</Button>
                <Button variant={filter === 'OFFLINE' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('OFFLINE')} className={filter === 'OFFLINE' ? 'bg-indigo-500 hover:bg-indigo-600 border-indigo-500' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'}>📦 Offline</Button>
                <Button variant={filter === 'EXPIRED' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('EXPIRED')} className={filter === 'EXPIRED' ? 'bg-slate-600' : ''}>Hết hạn</Button>
                <Button variant={filter === 'CANCELLED' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('CANCELLED')} className={filter === 'CANCELLED' ? 'bg-red-500' : 'border-red-200 text-red-600 hover:bg-red-50'}>Đã hủy</Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-32 bg-slate-100" />
                            <CardContent className="p-4 space-y-4">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredAuctions.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
                    <Gavel className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">Chưa có phiên đấu giá nào</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">Hãy tạo phiên đấu giá đầu tiên để bắt đầu bán xe với giá tốt nhất.</p>
                    <Link href="/vendor/auctions/create">
                        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">Tạo ngay</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map((auction) => (
                        <Card key={auction.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-48 bg-slate-200">
                                {auction.items?.[0]?.product?.imageUrl ? (
                                    <img src={auction.items[0].product.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <ImageIcon className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <Badge variant="outline" className={cn("shadow-sm font-bold", auction.type === 'LIVESTREAM' ? "border-rose-200 text-white bg-rose-500" : "border-indigo-200 text-white bg-indigo-500")}>
                                        {auction.type === 'LIVESTREAM' ? '🔴 Livestream' : '📦 Offline'}
                                    </Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(auction.status, auction.startTime)}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 border-b flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={auction.title}>
                                        {auction.title}
                                    </h3>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-3 relative">
                                <div className="text-sm border-b pb-3">
                                    <div className="flex justify-between items-center text-slate-500 mb-1">
                                        <span>Khởi điểm:</span>
                                        <span className="font-semibold text-slate-800">{auction.startPrice.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500">
                                        <span>Giá hiện tại:</span>
                                        <span className="font-bold text-blue-600 text-base">{auction.currentPrice?.toLocaleString('vi-VN') || auction.startPrice.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-slate-500 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Bắt đầu: {new Date(auction.startTime).toLocaleString('vi-VN')}</span>
                                        <AuctionCountdown startTime={auction.startTime} status={auction.status} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Kết thúc: {new Date(auction.endTime).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Link href={`/auctions/${auction.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Eye className="w-3.5 h-3.5" />
                                                Xem Sàn
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                            onClick={() => openRegistrationsModal(auction.id)}
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            Duyệt người
                                            {auction.registrations?.filter((r: any) => r.status === 'PENDING').length > 0 && (
                                                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                                                    {auction.registrations.filter((r: any) => r.status === 'PENDING').length}
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                    {(auction.status === 'PENDING' || (auction.status === 'ACTIVE' && new Date(auction.startTime).getTime() > new Date().getTime())) && (
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/vendor/auctions/${auction.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="px-2 border">
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AuctionRegistrationsModal 
                isOpen={isRegistrationsModalOpen}
                auctionId={selectedAuctionId}
                onClose={() => {
                    setIsRegistrationsModalOpen(false);
                    setSelectedAuctionId(null);
                }}
                onUpdate={fetchAuctions}
            />
        </div>
    );
}
