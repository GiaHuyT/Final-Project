"use client";

import React, { useEffect, useState } from 'react';
import {
    Search,
    Gavel,
    Clock,
    MoreHorizontal,
    History,
    TrendingUp,
    Ban,
    Loader2,
    Eye,
    CheckCircle2,
    Calendar,
    DollarSign,
    User
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface Auction {
    id: number;
    title: string;
    startPrice: number;
    currentPrice: number | null;
    startTime: string;
    endTime: string;
    status: string;
    vendor: { username: string, email: string };
    _count: { bids: number };
}

export default function AuctionManagementPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const response = await http.get('/auctions');
            setAuctions(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách đấu giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const handleUpdateStatus = async (auctionId: number, status: string) => {
        try {
            await http.patch(`/auctions/${auctionId}/status`, { status });
            toast.success("Cập nhật trạng thái thành công");
            fetchAuctions();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    const filteredAuctions = auctions.filter(auction =>
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.vendor?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        active: auctions.filter(a => a.status === 'ACTIVE').length,
        pending: auctions.filter(a => a.status === 'PENDING').length,
        finished: auctions.filter(a => a.status === 'FINISHED').length
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản lý đấu giá</h1>
                    <p className="text-muted-foreground font-medium">Giám sát và phê duyệt các phiên đấu giá ô tô trên toàn quốc.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-orange-200 bg-orange-50 text-orange-700 font-bold uppercase text-[10px] tracking-widest animate-pulse">
                        <TrendingUp className="w-3.5 h-3.5 mr-2" />
                        Live: {stats.active} phiên
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-xl shadow-green-100/50 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-green-50/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-green-600 uppercase text-[10px] tracking-widest">Đang diễn ra</CardDescription>
                            <div className="p-2 bg-green-100 rounded-xl">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black">{stats.active}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-gray-400 capitalize">Phiên đấu giá công khai</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-orange-100/50 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-orange-50/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-orange-600 uppercase text-[10px] tracking-widest">Chờ phê duyệt</CardDescription>
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Clock className="h-4 w-4 text-orange-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black">{stats.pending}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-gray-400 capitalize">Cần xử lý phê duyệt</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">Đã kết thúc</CardDescription>
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <History className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black">{stats.finished}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-gray-400 capitalize">Lịch sử các phiên đấu</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30 px-10 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-gray-800">Tất cả phiên đấu giá</CardTitle>
                            <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">Quản lý trạng thái và lượt thầu trực tiếp</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Tìm tiêu đề, vendor..."
                                className="pl-12 h-14 rounded-2xl bg-white border-gray-100 focus:ring-4 focus:ring-blue-100 font-bold transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-96 items-center justify-center">
                            <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-10 py-6">Phiên đấu giá</th>
                                        <th className="px-10 py-6">Vendor / Nhà thầu</th>
                                        <th className="px-10 py-6">Giá thầu hiện tại</th>
                                        <th className="px-10 py-6">Lượt thầu</th>
                                        <th className="px-10 py-6">Kết thúc</th>
                                        <th className="px-10 py-6 text-center">Trạng thái</th>
                                        <th className="px-10 py-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAuctions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-10 py-24 text-center text-gray-400 font-bold italic">
                                                Không tìm thấy phiên đấu giá nào phù hợp.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAuctions.map((auction) => (
                                            <tr key={auction.id} className="hover:bg-blue-50/10 transition-colors group">
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="rounded-2xl bg-blue-50/50 p-3 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-700 transition-all duration-300">
                                                            <Gavel className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                        <div className="max-w-[180px]">
                                                            <div className="font-black text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">#AUCT-{auction.id}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 truncate">{auction.title}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 font-black text-xs text-gray-700">
                                                            <User className="h-3 w-3 text-blue-500" />
                                                            {auction.vendor?.username}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">{auction.vendor?.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex flex-col">
                                                        <div className="font-black text-emerald-600 text-base">
                                                            {(auction.currentPrice || auction.startPrice).toLocaleString()} <span className="text-[10px] font-black opacity-60 ml-0.5 uppercase">vnđ</span>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">Start: {auction.startPrice.toLocaleString()}</div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-900 border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                                                        {auction._count.bids}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle">
                                                    <div className="flex items-center gap-2 font-bold text-gray-500 text-xs">
                                                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                                        {new Date(auction.endTime).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-center">
                                                    <Badge
                                                        className={`rounded-full px-4 py-1.5 uppercase text-[9px] font-black shadow-sm border-2 transition-all ${
                                                            auction.status === 'ACTIVE' 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : auction.status === 'PENDING'
                                                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                                        }`}
                                                    >
                                                        {auction.status === 'ACTIVE' ? 'Live Now' :
                                                            auction.status === 'PENDING' ? 'Waiting Admin' : 'Finished'}
                                                    </Badge>
                                                </td>
                                                <td className="px-10 py-6 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-white hover:shadow-2xl border border-transparent hover:border-gray-100 transition-all">
                                                                <MoreHorizontal className="h-6 w-6 text-gray-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-[1.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 min-w-[200px] backdrop-blur-xl bg-white/95">
                                                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 px-4 py-3 tracking-widest text-center">Hành động đấu giá</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="mb-2" />
                                                            <DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter">
                                                                <Eye className="h-4 w-4" />
                                                                Chi tiết phiên thầu
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-black text-xs uppercase tracking-tighter">
                                                                <History className="h-4 w-4" />
                                                                Lịch sử đặt giá
                                                            </DropdownMenuItem>
                                                            {auction.status === 'PENDING' && (
                                                                <>
                                                                    <DropdownMenuSeparator className="my-2" />
                                                                    <DropdownMenuItem
                                                                        className="gap-3 rounded-xl px-4 py-3 bg-emerald-600 text-white focus:bg-emerald-700 focus:text-white cursor-pointer font-black text-xs uppercase tracking-tighter shadow-lg shadow-emerald-100"
                                                                        onClick={() => handleUpdateStatus(auction.id, 'ACTIVE')}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                        Duyệt & Public
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            <DropdownMenuSeparator className="my-2" />
                                                            <DropdownMenuItem
                                                                className="gap-3 text-red-600 rounded-xl px-4 py-3 focus:bg-red-50 focus:text-red-600 cursor-pointer font-black text-xs uppercase tracking-tighter"
                                                                onClick={() => handleUpdateStatus(auction.id, 'FINISHED')}
                                                                disabled={auction.status === 'FINISHED'}
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                                Đóng phiên ngay
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
        </div>
    );
}
