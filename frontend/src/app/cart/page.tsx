"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
    const { items, isLoading, updateQuantity, removeItem, getTotalPrice, fetchCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    if (isLoading && items.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 pt-16">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 font-headline mb-4">Giỏ hàng trống</h1>
                <p className="text-slate-500 mb-8 max-w-sm text-center">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các mẫu xe đẳng cấp ngay hôm nay.</p>
                <Link 
                    href="/categories" 
                    className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl shadow-slate-900/20"
                >
                    Khám phá xe ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl font-black text-slate-900 font-headline mb-10 tracking-tight">Giỏ hàng của bạn</h1>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Danh sách xe */}
                    <div className="flex-1 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-center shadow-sm border border-slate-100 hover:border-slate-300 transition-colors">
                                {/* Hình ảnh */}
                                <div className="w-full sm:w-56 h-36 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
                                    <img 
                                        src={item.product.imageUrl || "/images/static/car-placeholder.png"} 
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Chi tiết */}
                                <div className="flex-1 w-full text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                                            {item.product.brand}
                                        </span>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-full shrink-0"
                                            title="Xóa khỏi giỏ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Link href={`/products/${item.product.id}`}>
                                        <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                    </Link>
                                    <div className="text-[11px] font-bold text-slate-400 mt-2 capitalize flex gap-2">
                                        <span>Trạng thái: Kho còn {item.product.stock} chiếc</span>
                                        <span>•</span>
                                        <span className={item.product.status ? "text-emerald-500" : "text-red-500"}>
                                            {item.product.status ? "Đang bán" : "Ngừng bán"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-between items-end mt-4 gap-4">
                                        <div className="text-2xl font-black text-slate-900">
                                            {item.product.price?.toLocaleString()} <span className="text-xs font-bold text-slate-400">VND</span>
                                        </div>
                                        
                                        {/* Nút cộng trừ */}
                                        <div className="flex items-center gap-4 bg-slate-50 rounded-full px-2 py-1 border border-slate-100 shadow-inner">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1 || isLoading}
                                            >
                                                <Minus className="w-4 h-4 p-[1px]" />
                                            </button>
                                            <span className="font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                                                disabled={item.quantity >= item.product.stock || isLoading}
                                            >
                                                <Plus className="w-4 h-4 p-[1px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tổng kết thanh toán */}
                    <div className="w-full lg:w-[420px] shrink-0">
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 lg:sticky lg:top-28 shadow-2xl">
                            <h2 className="text-xl font-black font-headline mb-6 border-b border-white/10 pb-6 uppercase tracking-widest text-slate-100">
                                Tóm tắt đơn hàng
                            </h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-slate-300 font-medium">
                                    <span>Tạm tính ({items.length} xe)</span>
                                    <span className="font-bold">{getTotalPrice().toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300 font-medium">
                                    <span>Thuế & Phí dự kiến</span>
                                    <span className="text-slate-400 text-sm">Chưa tính</span>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tổng cộng</span>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                            {getTotalPrice().toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">VND</div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => router.push('/checkout')} // Placeholder for checkout
                                className="group w-full bg-white text-slate-900 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                ĐĂNG KÝ THANH TOÁN
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-[10px] text-slate-400 font-medium text-center mt-6 leading-relaxed">
                                Bạn sẽ không bị trừ tiền ngay bây giờ. Bộ phận Sale của AutoBid sẽ liên hệ xác nhận và làm Hợp đồng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
