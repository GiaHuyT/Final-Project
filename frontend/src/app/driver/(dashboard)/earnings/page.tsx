"use client";

import React, { useState } from 'react';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    CheckCircle2, 
    XCircle,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_EARNINGS = {
    balance: 2450000,
    daily: { total: 450000, completed: 3, canceled: 0 },
    weekly: { total: 3150000, completed: 21, canceled: 2 },
    monthly: { total: 12450000, completed: 85, canceled: 5 },
};

const MOCK_TRANSACTIONS = [
    { id: 1, type: 'IN', amount: 150000, title: 'Thu nhập cuốc xe: Lái xe hộ', time: '14:30 - Hôm nay', status: 'Thành công' },
    { id: 2, type: 'OUT', amount: 30000, title: 'Phí nền tảng (20%)', time: '14:30 - Hôm nay', status: 'Đã trừ' },
    { id: 3, type: 'IN', amount: 300000, title: 'Thu nhập cuốc xe: Lái xe hộ (Đường dài)', time: '09:15 - Hôm nay', status: 'Thành công' },
    { id: 4, type: 'OUT', amount: 60000, title: 'Phí nền tảng (20%)', time: '09:15 - Hôm nay', status: 'Đã trừ' },
    { id: 5, type: 'WITHDRAW', amount: 1000000, title: 'Rút tiền về Vietcombank', time: '18:00 - Hôm qua', status: 'Đang xử lý' },
    { id: 6, type: 'IN', amount: 200000, title: 'Thu nhập cuốc xe: Lái xe hộ', time: '15:20 - Hôm qua', status: 'Thành công' },
];

export default function EarningsPage() {
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const handleWithdraw = () => {
        if (!withdrawAmount || parseInt(withdrawAmount) < 50000) {
            alert("Số tiền rút tối thiểu là 50.000đ");
            return;
        }
        if (parseInt(withdrawAmount) > MOCK_EARNINGS.balance) {
            alert("Số tiền rút vượt quá số dư khả dụng!");
            return;
        }
        alert(`Yêu cầu rút ${parseInt(withdrawAmount).toLocaleString('vi-VN')}đ đã được gửi thành công!`);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
    };

    const renderStats = (data: any) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="border-none shadow-sm bg-emerald-50/50">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-emerald-600 mb-1">Tổng thu nhập</p>
                            <h3 className="text-3xl font-bold text-slate-800">
                                {data.total.toLocaleString('vi-VN')}đ
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-sky-50/50">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-sky-600 mb-1">Chuyến thành công</p>
                            <h3 className="text-3xl font-bold text-slate-800">
                                {data.completed} <span className="text-lg text-slate-500 font-normal">chuyến</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-sky-100 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-sky-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-rose-50/50">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-rose-600 mb-1">Chuyến bị hủy</p>
                            <h3 className="text-3xl font-bold text-slate-800">
                                {data.canceled} <span className="text-lg text-slate-500 font-normal">chuyến</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-rose-100 rounded-xl">
                            <XCircle className="w-6 h-6 text-rose-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header & Balance Card */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Báo cáo thu nhập</h1>
                        <p className="text-slate-500 mt-1">Quản lý doanh thu và rút tiền về tài khoản ngân hàng</p>
                    </div>

                    <Card className="w-full md:w-auto bg-gradient-to-br from-slate-800 to-slate-900 border-none shadow-lg text-white">
                        <CardContent className="p-6 flex items-center justify-between gap-8">
                            <div>
                                <p className="text-slate-300 text-sm font-medium mb-1">Số dư khả dụng</p>
                                <div className="text-3xl font-bold">
                                    {MOCK_EARNINGS.balance.toLocaleString('vi-VN')}<span className="text-xl ml-1">đ</span>
                                </div>
                            </div>
                            
                            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md">
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Rút tiền
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">Rút tiền về Ngân hàng</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-500 mb-1">Ngân hàng thụ hưởng</p>
                                            <p className="font-bold text-slate-800">Vietcombank - 0123456789 (NGUYEN VAN A)</p>
                                            <p className="text-xs text-emerald-600 mt-2 cursor-pointer hover:underline">Thay đổi tài khoản</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số tiền cần rút</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number" 
                                                    placeholder="0"
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    className="pr-12 text-lg font-semibold"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">VNĐ</div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Khả dụng: <strong className="text-slate-800">{MOCK_EARNINGS.balance.toLocaleString('vi-VN')}đ</strong></span>
                                                <button 
                                                    className="text-emerald-600 font-bold hover:underline"
                                                    onClick={() => setWithdrawAmount(MOCK_EARNINGS.balance.toString())}
                                                >
                                                    Rút toàn bộ
                                                </button>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-base" onClick={handleWithdraw}>
                                            Xác nhận rút tiền
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Earnings Stats Tabs */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg">Thống kê hoạt động</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="today" className="w-full">
                            <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl">
                                <TabsTrigger value="today" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Hôm nay</TabsTrigger>
                                <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Tuần này</TabsTrigger>
                                <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Tháng này</TabsTrigger>
                            </TabsList>
                            <TabsContent value="today">{renderStats(MOCK_EARNINGS.daily)}</TabsContent>
                            <TabsContent value="week">{renderStats(MOCK_EARNINGS.weekly)}</TabsContent>
                            <TabsContent value="month">{renderStats(MOCK_EARNINGS.monthly)}</TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg">Lịch sử Dòng tiền</CardTitle>
                        <Button variant="outline" size="sm" className="text-slate-500 hidden md:flex">
                            <Download className="w-4 h-4 mr-2" />
                            Xuất Excel
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {MOCK_TRANSACTIONS.map((tx) => (
                                <div key={tx.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                            tx.type === 'IN' ? 'bg-emerald-100 text-emerald-600' :
                                            tx.type === 'OUT' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                        )}>
                                            {tx.type === 'IN' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-[15px]">{tx.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-500">{tx.time}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className={cn(
                                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                                    tx.status === 'Thành công' ? "bg-emerald-50 text-emerald-600" :
                                                    tx.status === 'Đang xử lý' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-lg font-bold",
                                            tx.type === 'IN' ? "text-emerald-600" : "text-slate-800"
                                        )}>
                                            {tx.type === 'IN' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
