"use client";

import React, { useState } from 'react';
import { 
    MapPin, 
    CalendarClock, 
    User, 
    Car, 
    CheckCircle2, 
    XCircle,
    Search,
    Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Dữ liệu giả
const MOCK_TRIPS = [
    { 
        id: 'TRP-88219', 
        date: '24/04/2026 - 14:30', 
        from: 'Nhà hàng Lan Rừng, Quận 1', 
        to: 'Vinhomes Central Park, Bình Thạnh', 
        customer: 'Nguyễn Văn A', 
        car: 'Vinfast VF8 - 51H 123.45', 
        price: 150000, 
        status: 'completed',
        distance: '5.2 km'
    },
    { 
        id: 'TRP-88218', 
        date: '24/04/2026 - 09:15', 
        from: 'Sân bay Tân Sơn Nhất, Tân Bình', 
        to: 'Khách sạn Rex, Quận 1', 
        customer: 'Trần Thị B', 
        car: 'Honda CRV - 51G 987.65', 
        price: 300000, 
        status: 'completed',
        distance: '8.4 km'
    },
    { 
        id: 'TRP-88215', 
        date: '23/04/2026 - 22:10', 
        from: 'Phố Tây Bùi Viện, Quận 1', 
        to: 'KDC Him Lam, Quận 7', 
        customer: 'Lê Hoàng C', 
        car: 'Toyota Camry - 51K 555.55', 
        price: 200000, 
        status: 'canceled', // Khách hủy
        distance: '6.1 km',
        cancelReason: 'Khách đổi ý'
    },
    { 
        id: 'TRP-88210', 
        date: '22/04/2026 - 19:00', 
        from: 'Landmark 81, Bình Thạnh', 
        to: 'Khu biệt thự Thảo Điền, Quận 2', 
        customer: 'Phạm Văn D', 
        car: 'Mercedes GLC - 51F 999.99', 
        price: 180000, 
        status: 'completed',
        distance: '4.5 km'
    },
];

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const renderTripCard = (trip: any) => (
        <div key={trip.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {trip.id}
                    </span>
                    <div className="flex items-center text-slate-500 text-sm mt-3 font-medium">
                        <CalendarClock className="w-4 h-4 mr-2 text-slate-400" />
                        {trip.date}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">{trip.price.toLocaleString('vi-VN')}đ</p>
                    <div className={cn(
                        "flex items-center justify-end gap-1 text-sm font-bold mt-1",
                        trip.status === 'completed' ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {trip.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {trip.status === 'completed' ? "Hoàn thành" : "Đã hủy"}
                    </div>
                </div>
            </div>

            <div className="relative pl-6 py-2 my-4">
                <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                <div className="absolute left-1.5 top-2 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500"></div>
                <div className="absolute left-1.5 bottom-2 w-4 h-4 rounded-full bg-rose-100 border-2 border-rose-500"></div>
                
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-400 mb-0.5">ĐIỂM ĐÓN</p>
                    <p className="font-medium text-slate-800">{trip.from}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 mb-0.5">ĐIỂM ĐẾN</p>
                    <p className="font-medium text-slate-800">{trip.to}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Khách hàng</p>
                        <p className="text-sm font-bold text-slate-800">{trip.customer}</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Car className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Phương tiện</p>
                        <p className="text-sm font-bold text-slate-800">{trip.car}</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Quãng đường</p>
                        <p className="text-sm font-bold text-slate-800">{trip.distance}</p>
                    </div>
                </div>
            </div>
            
            {trip.status === 'canceled' && (
                <p className="text-sm text-rose-600 font-medium mt-3 bg-rose-50 p-2 rounded-lg text-center">
                    Lý do hủy: {trip.cancelReason}
                </p>
            )}
        </div>
    );

    const filteredTrips = MOCK_TRIPS.filter(t => 
        t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const completedTrips = filteredTrips.filter(t => t.status === 'completed');
    const canceledTrips = filteredTrips.filter(t => t.status === 'canceled');

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử Cuốc xe</h1>
                    <p className="text-slate-500 mt-1">Xem lại các chuyến đi bạn đã thực hiện</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Tìm kiếm theo mã chuyến hoặc tên khách..." 
                        className="pl-12 h-14 rounded-xl border-slate-200 bg-white text-base shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-200/50 p-1 rounded-xl h-12">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600">
                            Tất cả ({filteredTrips.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
                            Hoàn thành ({completedTrips.length})
                        </TabsTrigger>
                        <TabsTrigger value="canceled" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600">
                            Đã hủy ({canceledTrips.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-4">
                        {filteredTrips.map(renderTripCard)}
                    </TabsContent>
                    <TabsContent value="completed" className="space-y-4">
                        {completedTrips.map(renderTripCard)}
                    </TabsContent>
                    <TabsContent value="canceled" className="space-y-4">
                        {canceledTrips.map(renderTripCard)}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
