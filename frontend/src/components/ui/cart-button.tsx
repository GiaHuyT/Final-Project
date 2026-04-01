"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { toast } from "react-hot-toast";

interface CartButtonProps {
    productId: number;
    className?: string;
    showText?: boolean;
}

export default function CartButton({ productId, className, showText = false }: CartButtonProps) {
    const { addItem } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product detail
        e.stopPropagation();

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }

        setIsLoading(true);
        const success = await addItem(productId, 1);
        setIsLoading(false);
    };

    if (showText) {
        return (
            <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={cn(
                    "w-full bg-slate-900 text-white rounded-full font-headline font-black text-sm tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-slate-200 py-5 flex items-center justify-center gap-2",
                    className
                )}
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                THÊM VÀO GIỎ HÀNG
            </button>
        );
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={cn(
                "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center transition-all shadow-xl backdrop-blur-md",
                "bg-white/90 text-slate-800 border-2 border-white/50 hover:bg-slate-900 hover:text-white hover:scale-110",
                isLoading && "opacity-70 pointer-events-none",
                className
            )}
            title="Thêm vào giỏ hàng"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
                <ShoppingCart className="w-5 h-5" />
            )}
        </button>
    );
}
