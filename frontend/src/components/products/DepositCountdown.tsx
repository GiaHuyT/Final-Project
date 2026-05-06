"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import CartButton from "@/components/ui/cart-button";

interface DepositCountdownProps {
    productId: number;
    depositEndsAt?: string | null;
}

export default function DepositCountdown({ productId, depositEndsAt }: DepositCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isReserving, setIsReserving] = useState(false);
    const router = useRouter();
    const { addItem } = useCart();

    useEffect(() => {
        if (!depositEndsAt) {
            setTimeLeft(null);
            return;
        }

        const targetDate = new Date(depositEndsAt).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [depositEndsAt]);

    const isReserved = timeLeft !== null;

    const handleReserve = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để đặt cọc");
            router.push("/auth/login");
            return;
        }

        setIsReserving(true);
        const success = await addItem(productId, 1);
        setIsReserving(false);
        
        if (success) {
            router.push("/cart");
        }
    };

    return (
        <div className="space-y-4">
            {isReserved ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-6 text-center animate-pulse">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Đã có người cọc - Thời gian giữ xe còn lại</p>
                    <div className="font-headline font-black text-2xl text-orange-500 mb-4 flex justify-center gap-2">
                        <div className="bg-white px-3 py-2 rounded-xl shadow-sm min-w-[3rem]">
                            <span>{timeLeft.days}</span><span className="text-xs font-bold text-orange-300 ml-1">d</span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-xl shadow-sm min-w-[3rem]">
                            <span>{timeLeft.hours.toString().padStart(2, '0')}</span><span className="text-xs font-bold text-orange-300 ml-1">h</span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-xl shadow-sm min-w-[3rem]">
                            <span>{timeLeft.minutes.toString().padStart(2, '0')}</span><span className="text-xs font-bold text-orange-300 ml-1">m</span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-xl shadow-sm min-w-[3rem]">
                            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span><span className="text-xs font-bold text-orange-300 ml-1">s</span>
                        </div>
                    </div>
                    <button disabled className="w-full bg-slate-200 text-slate-400 py-5 rounded-full font-headline font-black text-sm tracking-widest cursor-not-allowed">
                        XE ĐANG BỊ TẠM KHÓA GIAO DỊCH
                    </button>
                </div>
            ) : (
                <>
                    <CartButton productId={productId} className="w-full bg-slate-900 border-2 border-slate-900 text-white" showText={true} />
                    <button 
                        onClick={handleReserve}
                        disabled={isReserving}
                        className="w-full bg-white text-slate-900 border-2 border-slate-900 py-5 rounded-full font-headline font-black text-sm tracking-widest hover:bg-slate-50 transition-all shadow-sm flex justify-center items-center gap-2"
                    >
                        {isReserving && <Loader2 className="w-5 h-5 animate-spin" />}
                        ĐẶT CỌC GIỮ CHỖ
                    </button>
                </>
            )}
            
            <button className="w-full bg-slate-100 text-slate-600 py-5 rounded-full font-headline font-black text-sm tracking-widest hover:bg-slate-200 transition-all">
                ĐẶT LỊCH XEM XE / TƯ VẤN
            </button>
        </div>
    );
}
