"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initSocket } from '@/lib/socket';
import { Video, ArrowLeft, Loader2, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function ViewerLivePage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params?.id as string;
    
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
            toast.error("Vui lòng đăng nhập để xem livestream");
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        const socket = initSocket('chat', token, user.id);

        // Join as viewer
        socket.emit('join-stream', { auctionId, isVendor: false });

        socket.on('webrtc-offer', async (data: { senderId: string, offer: any }) => {
            console.log("Received offer from vendor");
            
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnection.current = pc;

            pc.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setIsConnected(true);
                    setIsConnecting(false);
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc-ice-candidate', {
                        targetId: data.senderId,
                        candidate: event.candidate,
                        auctionId
                    });
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('webrtc-answer', {
                targetId: data.senderId,
                answer,
                auctionId
            });
        });

        socket.on('webrtc-ice-candidate', async (data: { senderId: string, candidate: any }) => {
            if (peerConnection.current && data.candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        // Fallback timeout if vendor is not live
        const timeout = setTimeout(() => {
            if (!isConnected) {
                setIsConnecting(false);
            }
        }, 10000);

        return () => {
            clearTimeout(timeout);
            socket.off('webrtc-offer');
            socket.off('webrtc-ice-candidate');
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [auctionId, router, isConnected]);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 mt-8 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/auctions/${auctionId}`}>
                        <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 hover:bg-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Video className="w-6 h-6 text-red-600" />
                            Livestream Phiên Đấu Giá
                        </h1>
                        <p className="text-slate-500 text-sm">Đang xem trực tiếp từ Cửa hàng.</p>
                    </div>
                </div>
                
                {isConnected && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold border border-red-200 shadow-sm animate-pulse">
                        <Signal className="w-5 h-5" />
                        TRỰC TIẾP
                    </div>
                )}
            </div>

            <Card className="bg-black border-none overflow-hidden shadow-2xl rounded-2xl">
                <CardContent className="p-0 relative aspect-video flex items-center justify-center">
                    
                    {!isConnected && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900">
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                    <p className="text-slate-300 font-medium">Đang kết nối đến phòng Live...</p>
                                    <p className="text-slate-500 text-sm">Vui lòng chờ giây lát</p>
                                </>
                            ) : (
                                <>
                                    <Video className="w-16 h-16 text-slate-600 mb-2" />
                                    <p className="text-slate-300 font-medium text-lg">Cửa hàng chưa bắt đầu phát sóng</p>
                                    <p className="text-slate-500 text-sm">Vui lòng quay lại sau khi phiên đấu giá bắt đầu</p>
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                                        onClick={() => window.location.reload()}
                                    >
                                        Thử lại
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                    
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        controls
                        className={`w-full h-full object-contain ${!isConnected ? 'hidden' : ''}`} 
                    />

                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                    <h3 className="font-bold text-blue-900">Hướng dẫn xem trực tiếp</h3>
                    <p className="text-blue-800 text-sm mt-1">
                        Luồng video được truyền tải trực tiếp qua công nghệ WebRTC độ trễ thấp. Hãy quay lại trang chi tiết đấu giá ở tab bên cạnh để đặt giá (Bid) trong khi theo dõi video tại tab này.
                    </p>
                </div>
            </div>
        </div>
    );
}
