"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    Gavel,
    Loader2,
    Eye,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    DollarSign,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface Auction {
    id: number;
    title: string;
    description: string | null;
    startPrice: number;
    currentPrice: number | null;
    startTime: string;
    endTime: string;
    status: string;
    vendor: {
        username: string;
        email: string;
    };
    _count: {
        bids: number;
    };
}

export function AuctionApprovalsTab() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchPendingAuctions = async () => {
        try {
            setLoading(true);
            const response = await http.get('/auctions?status=PENDING');
            setAuctions(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách đấu giá chờ duyệt:", error);
            toast.error("Không thể tải danh sách đấu giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAuctions();
    }, []);

    const handleApprove = async (auctionId: number) => {
        try {
            await http.patch(`/auctions/${auctionId}/status`, { status: "ACTIVE" });
            toast.success("Đã phê duyệt và kích hoạt phiên đấu giá");
            fetchPendingAuctions();
        } catch (error) {
            toast.error("Phê duyệt thất bại");
        }
    };

    const handleDecline = async (auctionId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối phiên đấu giá này?")) return;
        try {
            await http.patch(`/auctions/${auctionId}/status`, { status: "REJECTED" });
            toast.success("Đã từ chối phiên đấu giá");
            fetchPendingAuctions();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const filteredAuctions = auctions.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.vendor.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase tracking-tighter">Phê duyệt Đấu giá</h1>
                <p className="text-muted-foreground font-medium">
                    Danh sách các phiên đấu giá mới đang chờ kiểm duyệt trước khi bắt đầu.
                </p>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30 px-10 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-gray-800">Phiên đấu giá chờ duyệt</CardTitle>
                            <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Tổng cộng: {auctions.length} phiên</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                            <Input
                                type="search"
                                placeholder="Tìm tiêu đề, nhà cung cấp..."
                                className="pl-12 h-12 rounded-2xl bg-white border-gray-100 focus:ring-4 focus:ring-blue-100 font-bold transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b">
                                    <tr>
                                        <th className="px-10 py-6">Phiên đấu giá</th>
                                        <th className="px-10 py-6">Nhà cung cấp</th>
                                        <th className="px-10 py-6">Giá khởi điểm</th>
                                        <th className="px-10 py-6">Thời gian</th>
                                        <th className="px-10 py-6 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredAuctions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-24 text-center">
                                                <p className="text-gray-400 font-bold italic">Không có phiên đấu giá nào đang chờ phê duyệt.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAuctions.map((auction) => (
                                            <tr key={auction.id} className="hover:bg-blue-50/10 transition-all group">
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-900 leading-tight">{auction.title}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">ID: #{auction.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-inner">
                                                            {auction.vendor.username.substring(0, 2)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 text-xs">{auction.vendor.username}</span>
                                                            <span className="text-[10px] text-gray-400">{auction.vendor.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <span className="font-black text-orange-600 text-base">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(auction.startPrice)}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                            Bắt đầu: {new Date(auction.startTime).toLocaleString('vi-VN')}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                                            <Clock className="h-3 w-3" />
                                                            Kết thúc: {new Date(auction.endTime).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => { setSelectedAuction(auction); setIsViewOpen(true); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all text-gray-400 hover:text-orange-600"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDecline(auction.id)}
                                                            className="h-10 w-10 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none transition-all"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleApprove(auction.id)}
                                                            className="h-10 px-4 rounded-xl bg-orange-600 text-white hover:bg-orange-700 border-none transition-all shadow-lg shadow-orange-100 flex items-center gap-2 font-black text-xs uppercase"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Duyệt
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 border-none shadow-3xl rounded-[2rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-8 pt-12 pb-20 relative">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 backdrop-blur-md">Chi tiết đấu giá</Badge>
                        <h2 className="text-3xl font-black text-white leading-tight pr-12">{selectedAuction?.title}</h2>
                        <div className="absolute top-8 right-8">
                            <Gavel className="h-12 w-12 text-white/20" />
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8 bg-white -mt-10 rounded-t-[2.5rem] relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá khởi điểm</p>
                                <p className="text-xl font-black text-orange-600">
                                    {selectedAuction && new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedAuction.startPrice)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nhà cung cấp</p>
                                <p className="font-bold text-gray-900 truncate">{selectedAuction?.vendor.username}</p>
                                <p className="text-[10px] text-gray-400 truncate">{selectedAuction?.vendor.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest border-l-4 border-orange-600 pl-3">Mô tả</h4>
                            <p className="text-sm text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl leading-relaxed italic">
                                {selectedAuction?.description || "Không có mô tả cho phiên đấu giá này."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-bold text-gray-500">Bắt đầu:</span>
                                <span className="font-black text-gray-900">{selectedAuction && new Date(selectedAuction.startTime).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-bold text-gray-500">Kết thúc:</span>
                                <span className="font-black text-gray-900">{selectedAuction && new Date(selectedAuction.endTime).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsViewOpen(false)} 
                                className="flex-1 rounded-xl h-12 font-black border-gray-200"
                            >
                                Đóng
                            </Button>
                            <Button 
                                onClick={() => { handleDecline(selectedAuction!.id); setIsViewOpen(false); }}
                                className="flex-1 rounded-xl h-12 font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none shadow-none"
                            >
                                Từ chối
                            </Button>
                            <Button 
                                onClick={() => { handleApprove(selectedAuction!.id); setIsViewOpen(false); }}
                                className="flex-[2] rounded-xl h-12 font-black bg-orange-600 text-white hover:bg-orange-700 border-none shadow-xl shadow-orange-100"
                            >
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Phê duyệt & Kích hoạt
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
