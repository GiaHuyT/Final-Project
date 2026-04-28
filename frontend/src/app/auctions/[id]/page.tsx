"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { Clock, Users, ArrowUpCircle, Gavel, Video, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import http from '@/lib/http';

const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = new URL(url).searchParams.get('v') || '';
        } else if (url.includes('youtube.com/live/')) {
            videoId = url.split('youtube.com/live/')[1].split('?')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
        }
        
        if (url.includes('facebook.com')) {
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
        }
        
        return url.replace("watch?v=", "embed/");
    } catch (e) {
        return url.replace("watch?v=", "embed/");
    }
};

export default function AuctionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [auction, setAuction] = useState<any>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [remainingTime, setRemainingTime] = useState<string>('');
    const [isEnded, setIsEnded] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [bidAmount, setBidAmount] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Nộp cọc state
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        fetchAuctionDetail();

        // Setup Socket.IO connection
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            newSocket.emit('joinAuction', { auctionId: Number(params.id) });
        });

        newSocket.on('newBid', (data: any) => {
            // Nhận tín hiệu có người đặt giá mới -> Cập nhật giao diện
            setCurrentPrice(data.currentPrice);
            if (data.endTime) {
                setEndTime(new Date(data.endTime));
            }
            if (data.bid) {
                setBids(prev => [data.bid, ...prev]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [params.id]);

    const fetchAuctionDetail = async () => {
        try {
            const res = await http.get(`/auctions/${params.id}`);
            const data = res.data;

            if (data) {
                setAuction(data);
                setCurrentPrice(data.currentPrice || data.startPrice);
                setEndTime(new Date(data.endTime));
                setBids(data.bids || []);
                setBidAmount((data.currentPrice + data.bidStep).toString());
            }
        } catch (error) {
            console.error("Lỗi khi tải phiên đấu giá", error);
        }
    };

    // Calculate time remaining every second
    useEffect(() => {
        if (!auction) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const startStr = auction.startTime ? new Date(auction.startTime).getTime() : 0;
            const endStr = auction.endTime ? new Date(auction.endTime).getTime() : (endTime ? endTime.getTime() : 0);

            let targetTime = endStr;
            let hasStarted = true;

            if (now < startStr) {
                targetTime = startStr;
                hasStarted = false;
            }

            const distance = targetTime - now;

            if (distance < 0) {
                if (!hasStarted) {
                    setRemainingTime("Đang mở phiên...");
                } else {
                    clearInterval(timer);
                    setRemainingTime("Đã hết giờ");
                    setIsEnded(true);
                }
            } else {
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);

                setRemainingTime(`${!hasStarted ? 'Sắp bắt đầu: ' : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                setIsEnded(!hasStarted ? true : false); // Disable bid if not started
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, auction]);

    // Polling for transitions (ACTIVE -> WAITING_PAYMENT -> COMPLETED)
    useEffect(() => {
        let pollTimer: any;
        if (auction?.status === 'ACTIVE' && isEnded) {
            // After time ends locally, the cron job might take a few seconds to update DB
            pollTimer = setInterval(fetchAuctionDetail, 3000);
        } else if (auction?.status === 'WAITING_PAYMENT') {
            // Poll to detect when the winner completes the PayOS transaction
            pollTimer = setInterval(fetchAuctionDetail, 3000);
        }
        return () => clearInterval(pollTimer);
    }, [isEnded, auction?.status]);

    const hasTriggeredPayment = useRef(false);
    const isWinner = currentUser && auction?.winnerId === currentUser.id;

    useEffect(() => {
        if (auction?.status === 'WAITING_PAYMENT' && isWinner && !hasTriggeredPayment.current) {
            hasTriggeredPayment.current = true;
            handleGeneratePayment();
        }
    }, [auction?.status, isWinner]);

    const handlePlaceBid = async () => {
        if (!currentUser) {
            toast.error("Bạn cần đăng nhập để đặt giá!");
            router.push('/auth/login');
            return;
        }

        if (auction.status === 'PENDING') {
            toast.error("Phiên đấu giá chưa bắt đầu!");
            return;
        }

        if (currentUser.id === auction.vendorId) {
            toast.error("Bạn không thể đấu giá sản phẩm của chính mình.");
            return;
        }

        const myReg = auction?.registrations?.find((r: any) => r.userId === currentUser.id);
        if (!myReg || myReg.status !== 'APPROVED') {
            toast.error("Bạn chưa được duyệt tham gia vòng đấu giá này.");
            return;
        }

        const amount = Number(bidAmount);
        const requiredBid = currentPrice + auction.bidStep;

        if (amount < requiredBid) {
            toast.error(`Bạn phải đặt tối thiểu ${requiredBid.toLocaleString('vi-VN')} VNĐ`);
            return;
        }

        if (socket) {
            socket.emit('placeBid', {
                auctionId: Number(params.id),
                userId: currentUser.id,
                bidAmount: amount
            }, (response: any) => {
                if (response?.status === 'error') {
                    toast.error(response.message);
                } else {
                    toast.success("Đặt giá thành công!");
                    setBidAmount((amount + auction.bidStep).toString());
                }
            });
        }
    };

    const handleRegisterClick = async () => {
        if (!currentUser) {
          toast.error('Vui lòng đăng nhập để đăng ký tham gia đấu giá!');
          router.push('/auth/login?redirect=/auctions/' + params.id);
          return;
        }
        
        if (auction.vendorId === currentUser?.id) {
            toast.error('Bạn là chủ sở hữu phiên đấu giá này.');
            return;
        }
    
        try {
          await http.post(`/auctions/${auction.id}/register`);
          toast.success('Đã gửi yêu cầu đăng ký tham gia!');
          // Update local state temporarily
          const updatedRegs = [...(auction.registrations || []), { userId: currentUser.id, status: 'PENDING' }];
          setAuction({ ...auction, registrations: updatedRegs });
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
        }
    };

    const handleGeneratePayment = async () => {
        try {
            setIsGeneratingPayment(true);
            const amount = Math.max(2000, Math.round(currentPrice * 0.00001)); // Cọc 0.001%, tối thiểu 2000đ cho PayOS
            const res = await http.post(`/transactions/auction/${auction.id}`, {
                amount,
                description: `Coc xe dau gia ${auction.id}`
            });
            const data = res.data;
            if (data.checkoutUrl) {
                // Chuyển hướng trực tiếp sang PayOS
                window.location.href = data.checkoutUrl;
            } else {
                toast.error("Không thể tạo link thanh toán");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi kết nối PayOS");
        } finally {
            setIsGeneratingPayment(false);
        }
    };

    if (!auction) {
        return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Phần Video/Hình ảnh xe */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-none shadow-xl bg-black">
                            {auction.type === 'LIVESTREAM' ? (
                                <div className="aspect-video relative w-full bg-slate-900 flex items-center justify-center">
                                    {auction.streamUrl ? (
                                        <iframe
                                            src={getEmbedUrl(auction.streamUrl)}
                                            className="w-full h-full absolute inset-0"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="text-white text-center">
                                            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-bold">WebRTC Livestreaming...</p>
                                            <p className="opacity-70 text-sm">Tính năng quay trực tiếp sẽ xuất hiện tại đây.</p>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        TRỰC TIẾP
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-slate-200 relative items-center justify-center flex overflow-hidden rounded-2xl">
                                    <img
                                        src={auction.items?.[0]?.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1550524458-9a9b08f8aeeb?q=80&w=1200'}
                                        alt="Car Image"
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/static/car-placeholder.png";
                                        }}
                                    />
                                </div>
                            )}
                        </Card>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 mb-2">{auction.type}</Badge>
                                    <h1 className="text-2xl font-bold text-slate-900">{auction.title}</h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-1">Cung cấp bởi</p>
                                    <p className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        {auction.vendor?.username}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{auction.description}</p>

                            {auction.items?.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="font-semibold text-slate-800 mb-3">Xe đấu giá trong phiên này:</h3>
                                    {auction.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border">
                                            <img 
                                                src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200'} 
                                                className="w-16 h-12 object-cover rounded" 
                                                onError={(e) => { e.currentTarget.src = "/images/static/car-placeholder.png"; }}
                                            />
                                            <div>
                                                <p className="font-bold text-slate-800">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500">Mã SP: #{item.product?.id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Detailed Specs for the first item */}
                        {auction.items?.[0]?.product && (() => {
                            const product = auction.items[0].product;
                            return (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-12 mt-6">
                                    {product.condition === 'Xe cũ' && (
                                    <div>
                                    <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-slate-100 mb-8">Tình trạng phương tiện</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Odo (Đã đi)</p>
                                            <p className="font-headline font-bold text-lg">{product.mileage ? `${product.mileage.toLocaleString('vi-VN')} km` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Biển số</p>
                                            <p className="font-headline font-bold text-lg">{product.licensePlate || '—'}</p>
                                        </div>
                                        <div className="col-span-2 lg:col-span-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả tình trạng</p>
                                            <p className="font-headline font-bold text-lg">{product.conditionDetail || '—'}</p>
                                        </div>
                                    </div>
                                    </div>
                                    )}

                                    <div>
                                    <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-slate-100 mb-8">Thông số Động cơ & Vận hành</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Động cơ & Nhiên liệu</p>
                                            <p className="font-headline font-bold text-lg">{product.engineCapacity ? `${product.engineCapacity}L` : ''} {product.fuelType || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Công suất tối đa</p>
                                            <p className="font-headline font-bold text-lg">{product.maxPower ? `${product.maxPower} hp` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô-men xoắn</p>
                                            <p className="font-headline font-bold text-lg">{product.maxTorque ? `${product.maxTorque} Nm` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hộp số</p>
                                            <p className="font-headline font-bold text-lg">{product.transmission || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hệ dẫn động</p>
                                            <p className="font-headline font-bold text-lg">{product.driveType || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tiêu thụ nhiên liệu</p>
                                            <p className="font-headline font-bold text-lg">{product.avgFuelConsumption ? `${product.avgFuelConsumption} L/100km` : '—'}</p>
                                        </div>
                                    </div>
                                    </div>

                                    <div>
                                    <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-slate-100 mb-8">Kích thước & Trọng lượng</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">D x R x C (mm)</p>
                                            <p className="font-headline font-bold text-lg">{product.length || '—'} x {product.width || '—'} x {product.height || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chiều dài cơ sở</p>
                                            <p className="font-headline font-bold text-lg">{product.wheelbase ? `${product.wheelbase} mm` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Khoảng sáng gầm</p>
                                            <p className="font-headline font-bold text-lg">{product.groundClearance ? `${product.groundClearance} mm` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trọng lượng không tải</p>
                                            <p className="font-headline font-bold text-lg">{product.curbWeight ? `${product.curbWeight} kg` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dung tích bình xăng</p>
                                            <p className="font-headline font-bold text-lg">{product.fuelTankCapacity ? `${product.fuelTankCapacity} L` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kiểu dáng (Body Type)</p>
                                            <p className="font-headline font-bold text-lg">{product.bodyType || '—'}</p>
                                        </div>
                                    </div>
                                    </div>

                                    <div>
                                    <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-slate-100 mb-8">Tiện nghi & An toàn</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Số túi khí</p>
                                            <p className="font-headline font-bold text-lg">{product.airbags || '—'}</p>
                                        </div>
                                        <div className="col-span-2 lg:col-span-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Trang bị nổi bật</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.autoConditioning && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Điều hòa tự động</span>}
                                                {product.infotainment && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Màn hình giải trí</span>}
                                                {product.appleCarplay && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Apple CarPlay/Android Auto</span>}
                                                {product.electricSeats && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Ghế chỉnh điện</span>}
                                                {product.camera360 && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Camera 360</span>}
                                                {product.abs && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Phanh ABS</span>}
                                                {product.esp && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Cân bằng ESP</span>}
                                                {product.ba && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Hỗ trợ phanh BA</span>}
                                                {product.rearSensor && <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">Cảm biến lùi</span>}
                                                {(!product.autoConditioning && !product.infotainment && !product.appleCarplay && !product.electricSeats && !product.camera360 && !product.abs && !product.esp && !product.ba && !product.rearSensor) && (
                                                    <span className="text-sm font-medium text-slate-500">Không có thông tin trang bị tiêu chuẩn.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Phần Bidding Box */}
                    <div className="space-y-6">
                        <Card className="shadow-xl border-orange-200 border-2 overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-orange-600 to-rose-600 p-6 text-center text-white">
                                <p className="text-orange-100 font-medium text-sm mb-1">GIÁ HIỆN TẠI</p>
                                <h2 className="text-4xl font-black tracking-tight">{currentPrice.toLocaleString('vi-VN')}đ</h2>

                                <div className="flex justify-center items-center gap-2 mt-4 bg-black/20 rounded-xl py-2 px-4 w-max mx-auto">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-mono font-bold text-xl">{remainingTime}</span>
                                </div>
                            </div>

                            <CardContent className="p-6 bg-white space-y-6">
                                {/* Xử lý trạng thái khi kết thúc */}
                                {auction.status === 'WAITING_PAYMENT' ? (
                                    <div className="bg-amber-50 border-amber-200 border rounded-xl p-5 text-center">
                                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                                        <h3 className="font-bold text-amber-900 text-lg mb-1">ĐÃ CHỐT ĐẤU GIÁ</h3>
                                        <p className="text-sm text-amber-700 mb-4">Đang đợi người có mức cược cao nhất nộp tiền đặt cọc 0,001% (Trong vòng 5 phút).</p>

                                        {currentUser?.id === auction.vendorId ? (
                                            <div className="bg-white p-3 rounded-lg border border-amber-100 mt-4 text-left">
                                                <p className="text-sm text-slate-500 mb-1">Đang đợi thanh toán từ:</p>
                                                <p className="font-bold text-amber-700 text-lg">{auction.winner?.username || 'Không xác định'}</p>
                                                <p className="text-xs text-slate-500">{auction.winner?.email}</p>
                                            </div>
                                        ) : isWinner ? (
                                            <Button
                                                onClick={handleGeneratePayment}
                                                disabled={isGeneratingPayment}
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 shadow-lg mt-4"
                                            >
                                                {isGeneratingPayment ? 'Đang tạo link thanh toán...' : `THANH TOÁN CỌC ${Math.max(2000, Math.round(currentPrice * 0.00001)).toLocaleString('vi-VN')}đ NGAY!`}
                                            </Button>
                                        ) : (
                                            <p className="text-xs bg-white py-2 rounded-lg text-slate-600">Bạn đứng hạng dưới. Vui lòng chờ xem Top 1 có bùng kèo không để tiếp tục đọ sức!</p>
                                        )}
                                    </div>
                                ) : auction.status === 'COMPLETED' ? (
                                    <div className="bg-emerald-50 border-emerald-200 border rounded-xl p-5 text-center space-y-3">
                                        <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                        <h3 className="font-bold text-emerald-900 text-lg mb-1">PHIÊN ĐẤU GIÁ ĐÃ KẾT THÚC</h3>
                                        
                                        {currentUser?.id === auction.vendorId ? (
                                            <div className="bg-white p-3 rounded-lg border border-emerald-100 text-left mt-4">
                                                <p className="text-sm text-slate-500 mb-1">Người chiến thắng (Đã đặt cọc):</p>
                                                <p className="font-bold text-emerald-700 text-lg">{auction.winner?.username || 'Không xác định'}</p>
                                                <p className="text-xs text-slate-500">{auction.winner?.email}</p>
                                            </div>
                                        ) : isWinner ? (
                                            <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg mt-4">
                                                <h4 className="font-bold text-xl mb-1">🎉 CHÚC MỪNG BẠN! 🎉</h4>
                                                <p className="text-sm">Bạn đã là người chiến thắng trong phiên đấu giá này.</p>
                                                <p className="text-xs mt-2 opacity-80">Tiền cọc đã được thanh toán thành công.</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white p-4 rounded-xl border border-emerald-100 mt-4">
                                                <p className="text-slate-700 text-sm">Rất tiếc, bạn đã không giành chiến thắng trong phiên này.</p>
                                                <p className="font-bold text-slate-900 mt-1">Chúc bạn may mắn lần sau! 🍀</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Box Đặt Giá / Đăng Ký */}
                                        {currentUser?.id === auction?.vendorId ? (
                                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center mt-4">
                                                <Badge className="bg-indigo-500 mb-2">Chủ phiên đấu giá</Badge>
                                                <p className="text-sm text-indigo-700">Bạn là người tổ chức phiên này. Bạn có thể theo dõi diễn biến và chat với khách hàng.</p>
                                                <Link href={`/vendor/auctions/${auction.id}/registrations`} className="block mt-4">
                                                    <Button className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Quản lý người tham gia
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (!auction?.registrations?.find((r: any) => r.userId === currentUser?.id) || auction?.registrations?.find((r: any) => r.userId === currentUser?.id)?.status !== 'APPROVED') && !isWinner ? (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3 mt-4">
                                                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                                                <h3 className="font-bold text-slate-800">Quyền đặt giá bị khóa</h3>
                                                <p className="text-sm text-slate-500 pb-2">Phiên đấu giá này yêu cầu bạn phải gửi yêu cầu đăng ký và chờ chủ tài sản phê duyệt trước khi được phép đặt giá.</p>
                                                
                                                {(() => {
                                                    const reg = auction?.registrations?.find((r: any) => r.userId === currentUser?.id);
                                                    if (!reg) {
                                                        return (
                                                            <Button onClick={handleRegisterClick} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-md h-12">
                                                                ĐĂNG KÝ THAM GIA ĐẤU GIÁ
                                                            </Button>
                                                        );
                                                    } else if (reg.status === 'PENDING' || reg.status === 'REGISTERED') {
                                                        return (
                                                            <Button disabled className="w-full bg-orange-100 text-orange-700 hover:bg-orange-100 font-bold opacity-80 h-12 cursor-not-allowed border border-orange-200">
                                                                ĐANG CHỜ CHỦ PHIÊN DUYỆT...
                                                            </Button>
                                                        );
                                                    } else if (reg.status === 'REJECTED') {
                                                        return (
                                                            <Button disabled className="w-full bg-red-100 text-red-700 hover:bg-red-100 font-bold opacity-80 h-12 cursor-not-allowed border border-red-200">
                                                                BỊ TỪ CHỐI THAM GIA
                                                            </Button>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="space-y-3 mt-4">
                                                <p className="text-sm font-semibold text-slate-700 mb-2">Đưa ra mức giá của bạn:</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        min={currentPrice + auction.bidStep}
                                                        step={auction.bidStep}
                                                        value={bidAmount}
                                                        onChange={e => setBidAmount(e.target.value)}
                                                        className="flex-1 w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">Bước giá tối thiểu: + {auction.bidStep.toLocaleString('vi-VN')}đ</p>

                                                <Button
                                                    onClick={handlePlaceBid}
                                                    disabled={isEnded || auction.status !== 'ACTIVE'}
                                                    className="w-full bg-slate-900 hover:bg-black text-white h-12 font-bold text-lg gap-2 mt-4"
                                                >
                                                    <Gavel className="w-5 h-5" />
                                                    ĐẶT GIÁ NGAY
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Lịch sử đặt giá */}
                                <div className="border-t pt-4 mt-6">
                                    <h3 className="font-bold text-slate-800 text-sm mb-3 flex justify-between items-center">
                                        <span>Lịch sử trả giá (Leaderboard)</span>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">{bids.length} lượt</Badge>
                                    </h3>

                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                        {bids.length === 0 ? (
                                            <p className="text-center text-slate-400 text-sm py-4 italic">Chưa có ai đặt giá.</p>
                                        ) : (
                                            bids.map((bid, i) => (
                                                <div key={bid.id || i} className={`p-3 rounded-lg flex justify-between items-center border ${i === 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${i === 0 ? 'text-orange-700' : 'text-slate-700'}`}>
                                                                {bid.user?.username || 'Ẩn danh'}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400">Vừa xong</span>
                                                        </div>
                                                    </div>
                                                    <span className={`font-mono font-bold ${i === 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                                                        {bid.bidAmount.toLocaleString('vi-VN')}đ
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
