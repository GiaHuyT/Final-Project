"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { Video, Mic, MicOff, VideoOff, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function VendorStudioPage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params?.id as string;
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    
    // Store socket reference
    const socketRef = useRef<any>(null);

    // Map of viewerId -> RTCPeerConnection
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    useEffect(() => {
        const token = Cookies.get('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
            toast.error("Vui lòng đăng nhập lại");
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        const socket = initSocket('chat', token, user.id);
        socketRef.current = socket;

        socket.emit('join-stream', { auctionId, isVendor: true });

        // Signaling handlers
        socket.on('viewer-joined', async (data: { viewerId: string }) => {
            console.log("New viewer joined:", data.viewerId);
            setViewerCount(prev => prev + 1);
            if (localStream) {
                await createOfferForViewer(data.viewerId, socket, localStream);
            }
        });

        socket.on('webrtc-answer', async (data: { senderId: string, answer: any }) => {
            console.log("Received answer from viewer:", data.senderId);
            const pc = peerConnections.current.get(data.senderId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on('webrtc-ice-candidate', async (data: { senderId: string, candidate: any }) => {
            const pc = peerConnections.current.get(data.senderId);
            if (pc && data.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            socket.off('viewer-joined');
            socket.off('webrtc-answer');
            socket.off('webrtc-ice-candidate');
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [auctionId, router, localStream]);

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
        if (socketRef.current) {
            socketRef.current.emit('stream-started', { auctionId });
        }
        toast.success("Đang phát sóng trực tiếp!");
    };

    const createOfferForViewer = async (viewerId: string, socket: any, stream: MediaStream) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
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
                    auctionId
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
            targetId: viewerId,
            offer,
            auctionId
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

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/auctions`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Livestream Studio</h1>
                        <p className="text-slate-500 text-sm">Phòng điều khiển phát sóng trực tiếp cho phiên đấu giá.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-800">{viewerCount} Người xem</span>
                </div>
            </div>

            <Card className="bg-slate-900 border-none overflow-hidden">
                <CardContent className="p-0 relative aspect-video flex items-center justify-center bg-black">
                    {!localStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                            <Video className="w-16 h-16 text-slate-600" />
                            <p className="text-slate-400">Camera đang tắt</p>
                            <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                                Bật Camera & Microphone
                            </Button>
                        </div>
                    )}
                    
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${!localStream ? 'hidden' : ''}`} 
                    />

                    {isStreaming && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            LIVE
                        </div>
                    )}

                    {localStream && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <Button 
                                onClick={toggleMic} 
                                variant={isMicOn ? "default" : "destructive"} 
                                size="icon" 
                                className="rounded-full w-12 h-12"
                            >
                                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                            
                            {!isStreaming ? (
                                <Button 
                                    onClick={startStream} 
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-full"
                                >
                                    BẮT ĐẦU PHÁT SÓNG
                                </Button>
                            ) : (
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-6 rounded-full"
                                >
                                    KẾT THÚC
                                </Button>
                            )}

                            <Button 
                                onClick={toggleVideo} 
                                variant={isVideoOn ? "default" : "destructive"} 
                                size="icon" 
                                className="rounded-full w-12 h-12"
                            >
                                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
