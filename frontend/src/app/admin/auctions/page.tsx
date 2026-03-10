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
    Loader2
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
    vendor: { username: string };
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
            console.error("Lỗi khi lấy danh sách đấu giá:", error);
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
        auction.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        active: auctions.filter(a => a.status === 'ACTIVE').length,
        pending: auctions.filter(a => a.status === 'PENDING').length,
        finished: auctions.filter(a => a.status === 'FINISHED').length
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý đấu giá</h1>
                    <p className="text-muted-foreground">Giám sát các phiên đấu giá trực tiếp và phê duyệt phiên mới.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang diễn ra</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Phiên đang đấu giá</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                        <History className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.finished}</div>
                        <p className="text-xs text-muted-foreground">Tổng số phiên kết thúc</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách phiên đấu giá</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm tiêu đề đấu giá..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tiêu đề</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Giá khởi điểm</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Giá hiện tại</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lượt đấu</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Thời gian kết thúc</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredAuctions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                Không tìm thấy phiên đấu giá nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAuctions.map((auction) => (
                                            <tr key={auction.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-md bg-primary/10 p-2">
                                                            <Gavel className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium max-w-[200px] truncate">{auction.title}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{auction.startPrice.toLocaleString()} ₫</td>
                                                <td className="p-4 align-middle font-bold text-green-600">{(auction.currentPrice || auction.startPrice).toLocaleString()} ₫</td>
                                                <td className="p-4 align-middle">{auction._count.bids}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(auction.endTime).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge
                                                        variant={
                                                            auction.status === 'ACTIVE' ? "default" :
                                                                auction.status === 'PENDING' ? "secondary" : "outline"
                                                        }
                                                    >
                                                        {auction.status === 'ACTIVE' ? 'Đang diễn ra' :
                                                            auction.status === 'PENDING' ? 'Chờ phê duyệt' : 'Kết thúc'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                            <DropdownMenuItem>Xem lịch sử đặt giá</DropdownMenuItem>
                                                            {auction.status === 'PENDING' && (
                                                                <DropdownMenuItem
                                                                    className="text-green-600 font-medium"
                                                                    onClick={() => handleUpdateStatus(auction.id, 'ACTIVE')}
                                                                >
                                                                    Duyệt đấu giá
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive gap-2"
                                                                onClick={() => handleUpdateStatus(auction.id, 'FINISHED')}
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                                Đóng phiên
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
