"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, User, CheckCircle2, Navigation as NavigationIcon, Phone, Loader2, AlertCircle, LocateFixed } from 'lucide-react';
import { toast } from 'react-hot-toast';
import http from '@/lib/http';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwipeButton } from '@/components/ui/swipe-button';
import { initSocket, disconnectSocket } from '@/lib/socket';
import Cookies from 'js-cookie';

// Dynamically import Map with SSR disabled
const MapRides = dynamic(() => import('@/components/driver/MapRides'), { 
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
        <span className="text-slate-400 font-medium animate-pulse">Đang tải bản đồ...</span>
    </div>
});

export default function FindRidesPage() {
    const [rides, setRides] = useState<any[]>([]);
    const [activeRides, setActiveRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const locationRef = useRef<[number, number] | null>(null);
    const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);
    const [isRegisteredShift, setIsRegisteredShift] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedDetails = localStorage.getItem('registered_shift_details');
        if (savedDetails) {
            try {
                const shifts = JSON.parse(savedDetails);
                if (shifts.length === 0) {
                    setIsRegisteredShift(false);
                } else {
                    const now = new Date();
                    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

                    const isCurrentlyInShift = shifts.some((s: any) => {
                        if (!s.startTime || !s.endTime) return false;
                        const [startH, startM] = s.startTime.split(':').map(Number);
                        const [endH, endM] = s.endTime.split(':').map(Number);
                        const startTotal = startH * 60 + startM;
                        const endTotal = endH * 60 + endM;
                        
                        if (endTotal <= startTotal) {
                            // Overnight shift (e.g., 18:00 to 06:00)
                            return currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal;
                        } else {
                            return currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal;
                        }
                    });
                    
                    setIsRegisteredShift(isCurrentlyInShift);
                }
            } catch (e) {
                setIsRegisteredShift(false);
            }
        } else {
            setIsRegisteredShift(false);
        }
        // Try to get user location using watchPosition for real-time tracking
        let watchId: number;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition((position) => {
                const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                setUserLocation(loc);
                locationRef.current = loc;
                fetchPendingRides(); // Fetch immediately when location updates
            }, (error) => {
                console.warn("Geolocation error:", error);
                // Default to Hanoi if denied
                const defaultLoc: [number, number] = [21.028511, 105.804817];
                if (!locationRef.current) {
                    setUserLocation(defaultLoc);
                    locationRef.current = defaultLoc;
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        } else {
            const defaultLoc: [number, number] = [21.028511, 105.804817];
            setUserLocation(defaultLoc);
            locationRef.current = defaultLoc;
        }

        fetchPendingRides();
        fetchActiveRides();
        
        // Setup socket to listen for ride updates
        const token = Cookies.get("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
            const userData = JSON.parse(userStr);
            const socket = initSocket('rides', token, userData.id);
            
            socket.on('ride-status-updated', (booking: any) => {
                // If a booking is updated (e.g. customer confirmed COMPLETED)
                fetchActiveRides();
            });
            
            socket.on('new-ride-request', () => {
                fetchPendingRides();
            });

            socket.on('ride-taken', () => {
                fetchPendingRides();
            });
        }

        // Polling every 10 seconds as backup
        const interval = setInterval(() => {
            fetchPendingRides();
            fetchActiveRides();
        }, 10000);

        return () => {
            clearInterval(interval);
            disconnectSocket('rides');
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    const fetchActiveRides = async () => {
        try {
            const res = await http.get('/driver-booking/driver');
            if (res.data) {
                const active = res.data.filter((r: any) => 
                    ['ACCEPTED', 'ARRIVED_AT_PICKUP', 'CAR_RECEIVED', 'ARRIVED_AT_DROPOFF', 'IN_PROGRESS'].includes(r.status)
                );
                setActiveRides(active);
            }
        } catch (error) {
            console.error("Error fetching active rides:", error);
        }
    };

    const fetchPendingRides = async () => {
        try {
            let url = '/driver-booking/pending';
            if (locationRef.current) {
                url += `?lat=${locationRef.current[0]}&lng=${locationRef.current[1]}`;
            }
            const res = await http.get(url);
            if (res.data) {
                setRides(res.data);
            }
        } catch (error) {
            console.error("Error fetching rides:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRide = async (rideId: number) => {
        try {
            setAcceptingId(rideId);
            await http.post(`/driver-booking/${rideId}/accept`);
            toast.success("Nhận cuốc xe thành công!");
            setActiveTab("active");
            fetchPendingRides();
            fetchActiveRides();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Nhận cuốc thất bại. Đơn đã có người khác nhận!");
            fetchPendingRides();
        } finally {
            setAcceptingId(null);
        }
    };

    const handleUpdateStatus = async (rideId: number, currentStatus: string) => {
        let nextStatus = '';
        if (currentStatus === 'ACCEPTED' || currentStatus === 'PENDING') nextStatus = 'ARRIVED_AT_PICKUP';
        else if (currentStatus === 'ARRIVED_AT_PICKUP') nextStatus = 'CAR_RECEIVED';
        else if (currentStatus === 'CAR_RECEIVED' || currentStatus === 'IN_PROGRESS') nextStatus = 'ARRIVED_AT_DROPOFF';
        else return;

        try {
            await http.patch(`/driver-booking/${rideId}/status`, { status: nextStatus });
            toast.success("Đã cập nhật trạng thái chuyến đi!");
            fetchActiveRides();
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái.");
        }
    };

    const handleMarkerClick = (rideId: number) => {
        setSelectedRideId(rideId);
        const el = document.getElementById(`ride-card-${rideId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const getSwipeText = (status: string) => {
        if (status === 'ACCEPTED' || status === 'PENDING') return "Vuốt khi tới điểm đón";
        if (status === 'ARRIVED_AT_PICKUP') return "Vuốt khi nhận bàn giao xe";
        if (status === 'CAR_RECEIVED' || status === 'IN_PROGRESS') return "Vuốt khi tới điểm đến";
        return "Hoàn thành";
    };

    if (isRegisteredShift === null) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;



    return (
        <div className="space-y-6 h-full flex flex-col pb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Tìm kiếm cuốc xe</h1>
                <p className="text-slate-500 text-sm">Các khách hàng đang cần thuê tài xế ở khu vực quanh bạn.</p>
            </div>

            {/* Map Section (Top) */}
            <div className="h-[40vh] min-h-[300px] w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                <MapRides 
                    rides={rides} 
                    userLocation={userLocation} 
                    onMarkerClick={handleMarkerClick}
                />
                
                <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                    <Button 
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            if (locationRef.current) {
                                const newLoc: [number, number] = [
                                    locationRef.current[0] + 0.005, 
                                    locationRef.current[1] + 0.005
                                ];
                                setUserLocation(newLoc);
                                locationRef.current = newLoc;
                                fetchPendingRides();
                                toast.success('Đã giả lập di chuyển (+500m)');
                            }
                        }}
                        className="shadow-md bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium text-xs justify-start"
                    >
                        <NavigationIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Giả lập hành trình
                    </Button>
                </div>
                
                <div className="absolute bottom-6 right-4 z-[400]">
                    <Button 
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                            if (navigator.geolocation) {
                                const toastId = toast.loading('Đang định vị...');
                                navigator.geolocation.getCurrentPosition(
                                    (pos) => {
                                        const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                                        setUserLocation(newLoc);
                                        locationRef.current = newLoc;
                                        fetchPendingRides();
                                        toast.success('Đã định vị chỗ bạn', { id: toastId });
                                    },
                                    (err) => {
                                        toast.error('Không thể lấy vị trí. Vui lòng bật GPS.', { id: toastId });
                                    },
                                    { enableHighAccuracy: true }
                                );
                            } else {
                                toast.error('Trình duyệt không hỗ trợ GPS');
                            }
                        }}
                        className="w-10 h-10 rounded-full shadow-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                    >
                        <LocateFixed className="w-5 h-5 text-blue-600" />
                    </Button>
                </div>

                <div className="absolute top-4 right-4 z-[400] bg-white px-4 py-2 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-slate-700">{rides.length} cuốc xe mới</span>
                </div>
            </div>

            {/* Rides List Section (Bottom) */}
            <div className="flex-1 space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 mb-6">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold rounded-md">Tìm kiếm ({rides.length})</TabsTrigger>
                        <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-semibold rounded-md">Đang làm ({activeRides.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending" className="mt-0 outline-none">
                        {isRegisteredShift === false ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-rose-300">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-rose-500" />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg">Ngoài ca làm việc</h3>
                                <p className="text-slate-500 text-sm mt-1 mb-4">Hiện tại không phải là thời gian ca làm việc bạn đã đăng ký. Vui lòng quay lại trong ca hoặc đăng ký thêm ca mới.</p>
                                <Button 
                                    onClick={() => router.push('/driver/schedule')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Đến trang đăng ký
                                </Button>
                            </div>
                        ) : loading && rides.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">Đang quét cuốc xe...</div>
                        ) : rides.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <NavigationIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">Chưa có cuốc xe nào</h3>
                        <p className="text-slate-500 text-sm mt-1">Hiện tại không có khách hàng nào đang tìm tài xế quanh khu vực của bạn.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rides.map(ride => (
                            <Card 
                                key={ride.id} 
                                id={`ride-card-${ride.id}`}
                                className={`transition-all duration-300 overflow-hidden ${selectedRideId === ride.id ? 'ring-2 ring-emerald-500 shadow-md transform scale-[1.01]' : 'hover:shadow-md'}`}
                            >
                                <CardContent className="p-0">
                                    <div className="p-4 bg-slate-50 border-b flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                                {ride.customer?.username?.[0] || 'K'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{ride.customer?.username || 'Khách hàng'}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> 
                                                    {new Date(ride.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-extrabold text-lg text-emerald-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ride.totalPrice)}
                                            </div>
                                            <div className="text-xs font-medium text-slate-500">Quãng đường: {ride.distanceKm} km</div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4 relative">
                                        {/* Route Timeline */}
                                        <div className="relative pl-6 space-y-4">
                                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                                            
                                            <div className="relative">
                                                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center z-10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700">Điểm đón</p>
                                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{ride.pickupAddress}</p>
                                            </div>
                                            
                                            <div className="relative">
                                                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-100 border border-blue-500 flex items-center justify-center z-10">
                                                    <MapPin className="w-2.5 h-2.5 text-blue-600" />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700">Điểm đến</p>
                                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{ride.dropoffAddress}</p>
                                            </div>
                                        </div>

                                        {/* Car info */}
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-xs">Loại xe</span>
                                                <span className="font-semibold text-slate-700">{ride.carBrand} {ride.carType}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-xs">Hộp số</span>
                                                <span className="font-semibold text-slate-700">{ride.transmission || 'Tự động'}</span>
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold py-6 text-lg"
                                            disabled={acceptingId === ride.id}
                                            onClick={() => handleAcceptRide(ride.id)}
                                        >
                                            {acceptingId === ride.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            {acceptingId === ride.id ? 'Đang nhận cuốc...' : 'Nhận cuốc xe này'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                    </TabsContent>

                    <TabsContent value="active" className="mt-0 outline-none">
                        {activeRides.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg">Chưa có cuốc xe nào đang làm</h3>
                                <p className="text-slate-500 text-sm mt-1">Các cuốc xe bạn nhận sẽ hiển thị ở đây.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                                {activeRides.map(ride => (
                                    <Card key={ride.id} className="overflow-hidden ring-2 ring-emerald-500 shadow-md bg-white">
                                        <CardContent className="p-0">
                                            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold shadow-sm border border-emerald-200 text-lg">
                                                        {ride.customer?.username?.[0] || 'K'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-lg">{ride.customer?.username || 'Khách hàng'}</div>
                                                        <div className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1">
                                                            {ride.status === 'ARRIVED_AT_DROPOFF' ? 'Chờ Khách Xác Nhận' : 'Đang Thực Hiện'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <a href={`tel:${ride.customer?.phonenumber}`} className="inline-flex items-center justify-center w-10 h-10 bg-white border border-emerald-200 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors shadow-sm">
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-5">
                                                <div className="relative pl-6 space-y-5">
                                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                                                    <div className="relative">
                                                        <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center z-10 ${['ACCEPTED', 'PENDING'].includes(ride.status) ? 'bg-emerald-100 border border-emerald-500' : 'bg-emerald-500 border border-emerald-600'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${['ACCEPTED', 'PENDING'].includes(ride.status) ? 'bg-emerald-600' : 'bg-white'}`}></div>
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-700">Điểm đón</p>
                                                        <p className="text-sm text-slate-500 mt-0.5">{ride.pickupAddress}</p>
                                                    </div>
                                                    <div className="relative">
                                                        <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center z-10 ${ride.status === 'ARRIVED_AT_DROPOFF' ? 'bg-blue-500 border border-blue-600' : 'bg-blue-100 border border-blue-500'}`}>
                                                            <MapPin className={`w-2.5 h-2.5 ${ride.status === 'ARRIVED_AT_DROPOFF' ? 'text-white' : 'text-blue-600'}`} />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-700">Điểm đến</p>
                                                        <p className="text-sm text-slate-500 mt-0.5">{ride.dropoffAddress}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-sm mt-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-500 text-xs">Loại xe</span>
                                                        <span className="font-semibold text-slate-800">{ride.carBrand} {ride.carType} ({ride.transmission})</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-slate-500 text-xs">Biển số</span>
                                                        <span className="font-bold text-slate-800 uppercase">{ride.licensePlate}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-slate-100">
                                                    {ride.status === 'ARRIVED_AT_DROPOFF' ? (
                                                        <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl p-4 text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                            <p className="font-bold text-sm">Đang chờ khách hàng xác nhận hoàn thành...</p>
                                                        </div>
                                                    ) : (
                                                        <SwipeButton 
                                                            text={getSwipeText(ride.status)}
                                                            onConfirm={() => handleUpdateStatus(ride.id, ride.status)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
