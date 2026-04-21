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

    // Polling for transition from ACTIVE -> WAITING_PAYMENT
    useEffect(() => {
        let pollTimer: any;
        if (isEnded && auction?.status === 'ACTIVE') {
            // After time ends locally, the cron job might take a few seconds to update DB
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
            const res = await http.post(`/transactions/auction/${auction.id}`, {
                amount: Math.round(currentPrice * 0.00001), // Cọc 0.001%
                description: `Coc xe dau gia ${auction.id}`
            });
            const data = res.data;
            if (data.checkoutUrl) {
                // Hiển thị iframe trực tiếp thay vì chuyển hướng
                setPaymentUrl(data.checkoutUrl);
            } else {
                toast.error("Không thể tạo link thanh toán");
            }
        } catch (error) {
            toast.error("Lỗi khi kết nối PayOS");
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
                                            src={auction.streamUrl.replace("watch?v=", "embed/")}
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
                                <div className="aspect-video bg-slate-200 relative items-center justify-center flex">
                                    <img
                                        src={auction.items?.[0]?.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1550524458-9a9b08f8aeeb?q=80&w=1200'}
                                        alt="Car Image"
                                        className="object-cover w-full h-full"
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
                                            <img src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200'} className="w-16 h-12 object-cover rounded" />
                                            <div>
                                                <p className="font-bold text-slate-800">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500">Mã SP: #{item.product?.id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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

                                        {isWinner ? (
                                            paymentUrl ? (
                                                <div className="mt-4 border border-amber-200 rounded-xl overflow-hidden shadow-lg h-[500px] w-full bg-white">
                                                    <iframe src={paymentUrl} className="w-full h-full border-none" />
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={handleGeneratePayment}
                                                    disabled={isGeneratingPayment}
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 shadow-lg"
                                                >
                                                    {isGeneratingPayment ? 'Đang tạo mã QR PayOS...' : `THANH TOÁN CỌC ${Math.round(currentPrice * 0.00001).toLocaleString('vi-VN')}đ NGAY!`}
                                                </Button>
                                            )
                                        ) : (
                                            <p className="text-xs bg-white py-2 rounded-lg text-slate-600">Bạn đứng hạng dưới. Vui lòng chờ xem Top 1 có bùng kèo không để tiếp tục đọ sức!</p>
                                        )}
                                    </div>
                                ) : auction.status === 'COMPLETED' ? (
                                    <div className="bg-emerald-50 border-emerald-200 border rounded-xl p-5 text-center">
                                        <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                        <h3 className="font-bold text-emerald-900 text-lg mb-1">PHIÊN NÀY ĐÃ BÁN</h3>
                                        <p className="text-sm text-emerald-700 font-semibold mt-2">Cọc đã được thu siêu tốc bằng PayOS.</p>
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
                                                    } else if (reg.status === 'PENDING') {
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
