"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '@/lib/socket';
import { formatPrice } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { Clock, Users, ArrowUpCircle, Gavel, Video, AlertCircle, ShieldCheck, Mic, MicOff, VideoOff, PictureInPicture, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
            return `https:// www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
        }
        
        return url.replace("watch?v=", "embed/");
    } catch (e) {
        return url.replace("watch?v=", "embed/");
    }
};

export default function AuctionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoggedIn, token } = useAuth();
    const { currency } = useCurrency();
    const [auction, setAuction] = useState<any>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [remainingTime, setRemainingTime] = useState<string>('');
    const [isEnded, setIsEnded] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [bidAmount, setBidAmount] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [viewedItemId, setViewedItemId] = useState<number | null>(null);

    // Nộp cọc state
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    // Trạng thái đăng ký cho Nhà cung cấp/Quản trị viên
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [showRegModal, setShowRegModal] = useState(false);
    const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);

    // Trạng thái của người xem
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // Đài truyền hình Hoa Kỳ
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        fetchAuctionDetail();

        // Thiết lập kết nối Socket.IO
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            newSocket.emit('joinAuction', { auctionId: Number(params.id) });
        });

        newSocket.on('newBid', (data: any) => {
            // Nhận tín hiệu có người đặt giá mới -> Cập nhật giao diện
            setCurrentPrice(data.currentPrice);
            if (data.remainingMs !== undefined && data.remainingMs !== null) {
                setEndTime(new Date(new Date().getTime() + data.remainingMs));
            } else if (data.endTime) {
                setEndTime(new Date(data.endTime));
            }
            if (data.bid) {
                setBids(prev => [data.bid, ...prev]);
            }
        });

        newSocket.on('registrationUpdate', () => {
            // Làm mới đăng ký nếu nhà cung cấp
            fetchRegistrations();
        });

        return () => {
            newSocket.disconnect();
        };
    }, [params.id]);

    const fetchRegistrations = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const u = JSON.parse(userStr);
            // Chỉ tìm nạp nếu quản trị viên hoặc nhà cung cấp
            if (u.role === 'ADMIN' || u.id === auction?.vendorId) {
                const res = await http.get(`/auctions/${params.id}/registrations`);
                setRegistrations(res.data);
            }
        } catch (e) {
            console.error("Lỗi khi tải danh sách đăng ký", e);
        }
    };

    useEffect(() => {
        if (auction && (currentUser?.role === 'ADMIN' || currentUser?.id === auction.vendorId)) {
            fetchRegistrations();
        }
    }, [auction, currentUser]);

    useEffect(() => {
        if (auction?.currentActiveItemId) {
            setViewedItemId(auction.currentActiveItemId);
        }
    }, [auction?.currentActiveItemId]);

    // WebRTC Logic for Livestream
    useEffect(() => {
        if (!auction) return;

        const isVendor = currentUser?.id === auction.vendorId || currentUser?.role === 'ADMIN';
        const token = Cookies.get('token') || '';
        const viewerId = currentUser?.id ? currentUser.id.toString() : `guest_${Math.random().toString(36).substr(2, 9)}`;
        const chatSocket = initSocket('chat', token, viewerId);
        
        chatSocket.emit('join-stream', { auctionId: params.id, isVendor });

        if (isVendor) {
            // Broadcaster Events
            chatSocket.on('viewer-joined', async (data: { viewerId: string }) => {
                console.log("New viewer joined:", data.viewerId);
                if (localStream) {
                    await createOfferForViewer(data.viewerId, chatSocket, localStream);
                }
            });

            chatSocket.on('webrtc-answer', async (data: { senderId: string, answer: any }) => {
                const pc = peerConnections.current.get(data.senderId);
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });

            chatSocket.on('webrtc-ice-candidate', async (data: { senderId: string, candidate: any }) => {
                const pc = peerConnections.current.get(data.senderId);
                if (pc && data.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            });
        } else {
            // Viewer Events
            chatSocket.on('webrtc-offer', async (data: { senderId: string, offer: any }) => {
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerConnection.current = pc;

                pc.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        remoteVideoRef.current.play().catch(e => console.warn("Auto-play prevented", e));
                    }
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        chatSocket.emit('webrtc-ice-candidate', {
                            targetId: data.senderId,
                            candidate: event.candidate,
                            auctionId: params.id
                        });
                    }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                chatSocket.emit('webrtc-answer', {
                    targetId: data.senderId,
                    answer,
                    auctionId: params.id
                });
            });

            chatSocket.on('webrtc-ice-candidate', async (data: { senderId: string, candidate: any }) => {
                if (peerConnection.current && data.candidate) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            });

            chatSocket.on('stream-started', () => {
                chatSocket.emit('join-stream', { auctionId: params.id, isVendor: false });
            });
        }

        return () => {
            if (chatSocket) {
                chatSocket.off('viewer-joined');
                chatSocket.off('webrtc-answer');
                chatSocket.off('webrtc-ice-candidate');
                chatSocket.off('webrtc-offer');
                chatSocket.off('stream-started');
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
        };
    }, [auction?.id, currentUser?.id, localStream]);

    // Warn vendor before leaving page
    useEffect(() => {
        if (!isStreaming || (currentUser?.id !== auction?.vendorId && currentUser?.role !== 'ADMIN')) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Bạn đang phát Live Stream! Nếu rời khỏi trang, luồng phát sẽ bị ngắt.';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isStreaming, currentUser, auction]);

    // Cleanup camera and PiP when component unmounts
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(() => {});
            }
        };
    }, [localStream]);

    // Broadcaster Helper Functions
    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Trình duyệt chặn Camera! Vui lòng dùng localhost hoặc HTTPS.");
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            toast.success("Camera sẵn sàng");
        } catch (error) {
            console.error("Lỗi lấy camera:", error);
            toast.error("Không thể truy cập Camera/Microphone");
        }
    };

    const startStream = () => {
        if (!localStream) {
            toast.error("Vui lòng bật Camera trước khi phát sóng");
            return;
        }
        setIsStreaming(true);
        const token = Cookies.get('token') || '';
        const chatSocket = initSocket('chat', token, currentUser.id);
        chatSocket.emit('stream-started', { auctionId: params.id });
        toast.success("Đang phát sóng trực tiếp!");
    };

    const createOfferForViewer = async (viewerId: string, socket: any, stream: MediaStream) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnections.current.set(viewerId, pc);

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', {
                    targetId: viewerId,
                    candidate: event.candidate,
                    auctionId: params.id
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
            targetId: viewerId,
            offer,
            auctionId: params.id
        });
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(!isMicOn);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOn(!isVideoOn);
        }
    };

    const fetchAuctionDetail = async () => {
        try {
            const res = await http.get(`/auctions/${params.id}`);
            const data = res.data;

            if (data) {
                setAuction(data);
                setCurrentPrice(data.currentPrice || data.startPrice);
                if (data.serverTime && data.endTime) {
                    const remainingMs = new Date(data.endTime).getTime() - new Date(data.serverTime).getTime();
                    setEndTime(new Date(new Date().getTime() + remainingMs));
                } else if (data.endTime) {
                    setEndTime(new Date(data.endTime));
                }
                setBids(data.bids || []);
                const newRequiredBid = (data.currentPrice || data.startPrice) + data.bidStep;
                setBidAmount(prev => {
                    if (Number(prev) < newRequiredBid) {
                        return newRequiredBid.toString();
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải phiên đấu giá", error);
        }
    };

    const startItem = async (itemId: number) => {
        try {
            await http.post(`/auctions/${params.id}/items/${itemId}/start`);
            toast.success("Đã đưa xe vào phiên đấu giá!");
            fetchAuctionDetail();
            // Emit socket event if needed or wait for poll
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Lỗi khi đưa xe vào phiên");
        }
    };

    const endItem = async (itemId: number) => {
        try {
            await http.post(`/auctions/${params.id}/items/${itemId}/end`);
            toast.success("Đã chốt kết quả xe này!");
            fetchAuctionDetail();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Lỗi khi kết thúc xe");
        }
    };

    const handleApproveRegistration = async (regId: number) => {
        try {
            await http.post(`/auctions/${params.id}/registrations/${regId}/approve`);
            toast.success("Đã duyệt người dùng!");
            fetchRegistrations();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt");
        }
    };

    const handleRejectRegistration = async (regId: number) => {
        try {
            await http.post(`/auctions/${params.id}/registrations/${regId}/reject`);
            toast.success("Đã từ chối người dùng!");
            fetchRegistrations();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi từ chối");
        }
    };

    const openLiveStudio = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setIsStreaming(false);
        }
        
        const width = 1200;
        const height = 800;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        window.open(`/auctions/${params.id}?studio=true`, 'LiveStudio', `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes`);
        
        toast.success("Đã chuyển phiên Live sang cửa sổ độc lập. Hãy quản lý tại đó!");
    };

    // Calculate time remaining every second
    const [paymentTimeLeft, setPaymentTimeLeft] = useState<string>('');
    const [breakTimeLeft, setBreakTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!auction) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const startStr = auction.startTime ? new Date(auction.startTime).getTime() : 0;
            const endStr = endTime ? endTime.getTime() : 0;

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

            // Payment timer countdown
            if (auction.status === 'WAITING_PAYMENT' && auction.endTime) {
                const paymentDeadline = new Date(auction.endTime).getTime() + 5 * 60 * 1000;
                const payDist = paymentDeadline - now;
                if (payDist <= 0) {
                    setPaymentTimeLeft('00:00');
                } else {
                    const pm = Math.floor((payDist % (1000 * 60 * 60)) / (1000 * 60));
                    const ps = Math.floor((payDist % (1000 * 60)) / 1000);
                    setPaymentTimeLeft(`${pm.toString().padStart(2, '0')}:${ps.toString().padStart(2, '0')}`);
                }
            }

            // Break timer countdown
            if (auction.breakEndsAt && !auction.currentActiveItemId) {
                const breakDeadline = new Date(auction.breakEndsAt).getTime();
                const breakDist = breakDeadline - now;
                if (breakDist <= 0) {
                    setBreakTimeLeft('Đang chuyển xe...');
                } else {
                    const bs = Math.floor((breakDist % (1000 * 60)) / 1000);
                    setBreakTimeLeft(`${bs.toString().padStart(2, '0')} giây`);
                }
            } else {
                setBreakTimeLeft('');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, auction]);

    // Polling for transitions (ACTIVE -> WAITING_PAYMENT -> COMPLETED)
    useEffect(() => {
        let pollTimer: any;
        if (auction?.type === 'LIVESTREAM' && auction?.status === 'ACTIVE') {
            // Poll for auto-transitions in livestream (breakEndsAt -> next item)
            pollTimer = setInterval(fetchAuctionDetail, 3000);
        } else if (auction?.status === 'ACTIVE' && isEnded) {
            // After time ends locally, the cron job might take a few seconds to update DB
            pollTimer = setInterval(fetchAuctionDetail, 3000);
        } else if (auction?.status === 'WAITING_PAYMENT') {
            // Poll to detect when the winner completes the PayOS transaction
            pollTimer = setInterval(fetchAuctionDetail, 3000);
        }
        return () => clearInterval(pollTimer);
    }, [isEnded, auction?.status, auction?.type]);

    // Prevent banned users from staying on the page
    useEffect(() => {
        const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub;
        if (!currentUserId || !auction) return;

        const myReg = auction.registrations?.find((r: any) => {
            const rId = r.userId || r.user?.id;
            return rId?.toString() === currentUserId.toString();
        });

        if (myReg?.status === 'BANNED') {
            toast.error("Tài khoản của bạn đã bị cấm khỏi phiên đấu giá này do vi phạm thời gian thanh toán!");
            router.push('/auctions');
        }
    }, [auction, currentUser, router]);

    const hasTriggeredPayment = useRef(false);
    const isWinner = currentUser && auction?.winnerId === currentUser.id;
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

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

        const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub;
        const myReg = auction?.registrations?.find((r: any) => {
            const rId = r.userId || r.user?.id;
            return rId?.toString() === currentUserId?.toString();
        });
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
          
          if (socket) {
              socket.emit('newRegistration', { auctionId: Number(params.id) });
          }

          // Update local state temporarily
          const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub;
          const updatedRegs = [...(auction.registrations || []), { userId: currentUserId, status: 'PENDING' }];
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
                setCheckoutUrl(data.checkoutUrl);
                // Mở tab mới thay vì điều hướng tab hiện tại
                window.open(data.checkoutUrl, '_blank');
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

    const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub;
    const myRegistration = auction.registrations?.find((r: any) => {
        const rId = r.userId || r.user?.id;
        return rId?.toString() === currentUserId?.toString();
    });

    if (myRegistration?.status === 'BANNED') {
        return null; // The useEffect above will redirect them
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Phần Video/Hình ảnh xe */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-none shadow-xl bg-black">
                            {auction.type === 'LIVESTREAM' ? (
                                <div className="aspect-video relative w-full bg-slate-900 flex items-center justify-center group">
                                    {(currentUser?.id === auction.vendorId || currentUser?.role === 'ADMIN') ? (
                                        // Studio View cho Chủ phòng
                                        <>
                                            {/* Top controls (always visible) */}
                                            <div className="absolute top-4 right-4 flex items-center gap-3 z-40">
                                                <Button variant="secondary" onClick={openLiveStudio} className="shadow-md bg-slate-800/80 text-white hover:bg-slate-700">
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Mở Studio Popup
                                                </Button>

                                                <Dialog open={showRegModal} onOpenChange={setShowRegModal}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="secondary" className="relative shadow-md bg-blue-600 hover:bg-blue-700 text-white border-0">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            Duyệt người xem
                                                            {registrations.filter(r => r.status === 'PENDING').length > 0 && (
                                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg ring-2 ring-white">
                                                                    {registrations.filter(r => r.status === 'PENDING').length}
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl bg-white">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl">Duyệt người đăng ký tham gia</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                                                            {registrations.length === 0 ? (
                                                                <p className="text-slate-500 text-center py-8">Chưa có người đăng ký nào.</p>
                                                            ) : (
                                                                registrations.map(reg => (
                                                                    <div key={reg.id} className="flex justify-between items-center p-4 border rounded-xl bg-slate-50 hover:bg-white transition-colors">
                                                                        <div className="flex items-center gap-4">
                                                                            <Avatar className="w-12 h-12">
                                                                                <AvatarImage src={reg.user?.avatar} />
                                                                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{reg.user?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 text-lg">{reg.user?.username}</p>
                                                                                <p className="text-sm text-slate-500">{reg.user?.email || reg.user?.phonenumber || 'Chưa cập nhật'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            {reg.status === 'PENDING' ? (
                                                                                <>
                                                                                    <Button size="sm" variant="outline" onClick={() => handleRejectRegistration(reg.id)} className="text-red-600 border-red-500 hover:bg-red-50 font-semibold bg-white">Từ chối</Button>
                                                                                    <Button size="sm" onClick={() => handleApproveRegistration(reg.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">Duyệt vào phòng</Button>
                                                                                </>
                                                                            ) : (
                                                                                <Badge className={reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 px-3 py-1 text-sm' : 'bg-red-100 text-red-700 px-3 py-1 text-sm'}>
                                                                                    {reg.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            {!localStream && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 z-20 bg-slate-900/80 backdrop-blur-sm">
                                                    <Video className="w-16 h-16 text-slate-400" />
                                                    <p className="text-slate-300 font-medium">Camera đang tắt</p>
                                                    <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-6 text-lg font-bold rounded-xl">
                                                        Bật Camera & Microphone
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            <video 
                                                ref={localVideoRef} 
                                                autoPlay 
                                                playsInline 
                                                muted 
                                                className={`w-full h-full absolute inset-0 object-cover ${!localStream ? 'hidden' : ''}`} 
                                            />

                                            {localStream && (
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Button 
                                                        onClick={toggleMic} 
                                                        variant={isMicOn ? "outline" : "destructive"} 
                                                        size="icon" 
                                                        title={isMicOn ? "Tắt Microphone" : "Bật Microphone"}
                                                        className={`rounded-full w-14 h-14 shadow-lg border-2 ${isMicOn ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' : 'text-white border-transparent'}`}
                                                    >
                                                        {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                                    </Button>
                                                    
                                                    {!isStreaming ? (
                                                        <Button 
                                                            onClick={startStream} 
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-7 text-lg rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                                                        >
                                                            BẮT ĐẦU PHÁT SÓNG
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            onClick={() => window.location.reload()} 
                                                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-7 text-lg rounded-full shadow-lg"
                                                        >
                                                            KẾT THÚC
                                                        </Button>
                                                    )}

                                                    <Button 
                                                        onClick={toggleVideo} 
                                                        variant={isVideoOn ? "outline" : "destructive"} 
                                                        size="icon" 
                                                        title={isVideoOn ? "Tắt Camera" : "Bật Camera"}
                                                        className={`rounded-full w-14 h-14 shadow-lg border-2 ${isVideoOn ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' : 'text-white border-transparent'}`}
                                                    >
                                                        {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Viewer View cho Khách
                                        auction.streamUrl ? (
                                            auction.streamUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video
                                                    src={auction.streamUrl}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    controls
                                                    className="w-full h-full absolute inset-0 object-cover bg-black"
                                                    onLoadedMetadata={(e) => {
                                                        if (auction.startTime) {
                                                            const start = new Date(auction.startTime).getTime();
                                                            const elapsed = (Date.now() - start) / 1000;
                                                            if (elapsed > 0) {
                                                                e.currentTarget.currentTime = elapsed;
                                                            }
                                                        }
                                                    }}
                                                    onTimeUpdate={(e) => {
                                                        if (auction.startTime) {
                                                            const start = new Date(auction.startTime).getTime();
                                                            const elapsed = (Date.now() - start) / 1000;
                                                            // Force sync if desynced by more than 5 seconds
                                                            if (elapsed > 0 && Math.abs(e.currentTarget.currentTime - elapsed) > 5) {
                                                                e.currentTarget.currentTime = elapsed;
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <iframe
                                                    src={getEmbedUrl(auction.streamUrl)}
                                                    className="w-full h-full absolute inset-0"
                                                    allowFullScreen
                                                />
                                            )
                                        ) : (
                                            <video
                                                ref={remoteVideoRef}
                                                autoPlay
                                                playsInline
                                                muted={true}
                                                controls
                                                className="w-full h-full absolute inset-0 object-cover bg-black"
                                            />
                                        )
                                    )}
                                    <div className={`absolute top-4 left-4 ${isStreaming || (currentUser?.id !== auction.vendorId && currentUser?.role !== 'ADMIN') ? 'bg-red-600' : 'bg-slate-600'} text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 z-30 shadow-md transition-colors`}>
                                        <div className={`w-2 h-2 bg-white rounded-full ${isStreaming || (currentUser?.id !== auction.vendorId && currentUser?.role !== 'ADMIN') ? 'animate-pulse' : ''}`}></div>
                                        TRỰC TIẾP
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-slate-900 relative items-center justify-center flex flex-col overflow-hidden rounded-2xl border-4 border-slate-800">
                                    {breakTimeLeft ? (
                                        <div className="z-10 text-center animate-in fade-in zoom-in duration-500">
                                            <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)] border-2 border-blue-500/50">
                                                <Clock className="w-10 h-10 text-blue-400 animate-pulse" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">NGHỈ GIẢI LAO</h2>
                                            <p className="text-slate-300 text-lg mb-6">Xe tiếp theo sẽ tự động lên sàn sau:</p>
                                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-lg font-mono">
                                                {breakTimeLeft}
                                            </div>
                                            {currentUser?.id === auction.vendorId && (
                                                <p className="text-sm text-slate-400 mt-8 bg-slate-800/50 py-2 px-4 rounded-full inline-block">
                                                    Bạn có thể bỏ qua thời gian chờ bằng cách tự bấm "Bắt đầu đấu giá xe này" ở danh sách bên dưới.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={auction.items?.[0]?.product?.imageUrl || auction.items?.[0]?.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1550524458-9a9b08f8aeeb?q=80&w=1200'}
                                                alt="Car Image"
                                                className="object-cover w-full h-full opacity-30 absolute inset-0 blur-sm mix-blend-overlay"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/images/static/car-placeholder.png";
                                                }}
                                            />
                                            <div className="z-10 text-center space-y-4">
                                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700 shadow-xl">
                                                    <Video className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-300 font-bold text-lg">Chưa có xe nào được đưa lên sàn</p>
                                            </div>
                                        </>
                                    )}
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
                                        <div 
                                            key={item.id} 
                                            onClick={() => setViewedItemId(item.id)}
                                            className={`flex gap-4 items-center p-3 rounded-lg border mb-3 cursor-pointer transition-all ${auction.currentActiveItemId === item.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : (viewedItemId === item.id || (!viewedItemId && auction.items.length === 1 && auction.items[0].id === item.id)) ? 'bg-white border-indigo-300 ring-1 ring-indigo-200' : 'bg-slate-50 hover:bg-slate-100'}`}
                                        >
                                            <img 
                                                src={item.product?.imageUrl || item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200'} 
                                                className="w-16 h-12 object-cover rounded" 
                                                onError={(e) => { e.currentTarget.src = "/images/static/car-placeholder.png"; }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500">Mã SP: #{item.product?.id}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.status === 'SOLD' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Đã bán</Badge>}
                                                {item.status === 'PASSED' && <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-300">Bỏ qua</Badge>}
                                                {auction.currentActiveItemId === item.id && <Badge className="bg-red-100 text-red-600 hover:bg-red-200 animate-pulse">ĐANG ĐẤU GIÁ</Badge>}
                                            </div>
                                            {(currentUser?.id === auction.vendorId || currentUser?.role === 'ADMIN') && auction.status === 'ACTIVE' && auction.type === 'LIVESTREAM' && (
                                                <div className="flex flex-col gap-2 ml-4">
                                                    {item.status === 'PENDING' && !auction.currentActiveItemId && (
                                                        <Button size="sm" onClick={() => startItem(item.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">Đưa vào phiên</Button>
                                                    )}
                                                    {auction.currentActiveItemId === item.id && (
                                                        <Button size="sm" variant="destructive" onClick={() => endItem(item.id)} className="text-xs h-8">Chốt xe này</Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Detailed Specs for the active or selected item */}
                        {auction.items?.length > 0 && (() => {
                            let displayItem = null;
                            if (auction.items.length === 1) {
                                displayItem = auction.items[0];
                            } else {
                                displayItem = auction.items.find((i: any) => i.id === viewedItemId) || 
                                              auction.items.find((i: any) => i.id === auction.currentActiveItemId);
                            }
                            
                            const product = displayItem?.product;
                            if (!product) return (
                                <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-dashed mt-6 text-center text-slate-500">
                                    Vui lòng chọn một xe trong danh sách hoặc đợi xe được đưa vào phiên đấu giá để xem thông số chi tiết.
                                </div>
                            );
                            
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
                                {currency !== 'VND' && (
                                    <p className="text-orange-200 font-semibold text-lg mt-1">(≈ {formatPrice(currentPrice, currency)})</p>
                                )}

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
                                            <div className="flex flex-col gap-2 mt-4">
                                                <div className="flex items-center justify-center gap-2 bg-white/60 text-red-600 font-bold py-2 rounded-lg border border-red-200">
                                                    <Clock className="w-4 h-4 animate-pulse" />
                                                    Còn lại: {paymentTimeLeft || '05:00'}
                                                </div>
                                                <Button
                                                    onClick={() => checkoutUrl ? window.open(checkoutUrl, '_blank') : handleGeneratePayment()}
                                                    disabled={isGeneratingPayment}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg animate-bounce hover:animate-none"
                                                >
                                                    {isGeneratingPayment ? 'Đang tạo link...' : 'MỞ CỔNG THANH TOÁN PAYOS'}
                                                </Button>
                                                <p className="text-xs text-amber-700/80">Hệ thống đã mở một tab thanh toán mới. Nếu không thấy, hãy bấm nút trên.</p>
                                            </div>
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
                                        {currentUser?.id === auction?.vendorId ? null : (auction.endTime && new Date().getTime() >= new Date(auction.endTime).getTime()) ? (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3 mt-4">
                                                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                                                <h3 className="font-bold text-slate-800">Phiên đấu giá đang được chốt</h3>
                                                <p className="text-sm text-slate-500">Hệ thống đang tổng hợp kết quả. Vui lòng chờ trong giây lát...</p>
                                            </div>
                                        ) : (!auction?.registrations?.find((r: any) => r.userId?.toString() === currentUser?.id?.toString()) || auction?.registrations?.find((r: any) => r.userId?.toString() === currentUser?.id?.toString())?.status !== 'APPROVED') && !isWinner ? (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3 mt-4">
                                                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                                                <h3 className="font-bold text-slate-800">Quyền đặt giá bị khóa</h3>
                                                <p className="text-sm text-slate-500 pb-2">Phiên đấu giá này yêu cầu bạn phải gửi yêu cầu đăng ký và chờ chủ tài sản phê duyệt trước khi được phép đặt giá.</p>
                                                
                                                {(() => {
                                                    const reg = auction?.registrations?.find((r: any) => r.userId?.toString() === currentUser?.id?.toString());
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
