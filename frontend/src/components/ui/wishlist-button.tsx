"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';
import { Button } from './button';

interface WishlistButtonProps {
    productId: number;
    initialIsFavorited?: boolean;
    className?: string;
}

const WishlistButton = ({ productId, initialIsFavorited = false, className }: WishlistButtonProps) => {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFavorited(initialIsFavorited);
    }, [initialIsFavorited]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
            return;
        }

        setIsLoading(true);
        try {
            const res = await http.post(`/favorites/toggle/${productId}`);
            setIsFavorited(res.data.favorited);
            if (res.data.favorited) {
                toast.success("Đã thêm vào danh sách yêu thích");
            } else {
                toast.success("Đã xóa khỏi danh sách yêu thích");
            }
        } catch (error: any) {
            console.error("[WishlistButton] Lỗi toggle favorite:", error);
            toast.error("Không thể cập nhật danh sách yêu thích");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant={isFavorited ? "destructive" : "outline"}
            size="icon"
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "rounded-full transition-all shadow-lg border-white/50",
                !isFavorited && "bg-white/90 backdrop-blur-md text-slate-900 hover:bg-slate-900 hover:text-white",
                className
            )}
        >
            <Heart className={cn("size-5", isFavorited && "fill-current")} />
        </Button>
    );
};

export default WishlistButton;
