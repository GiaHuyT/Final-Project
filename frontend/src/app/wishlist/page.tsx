"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";
import { toast } from "react-hot-toast";
import { Loader2, Car, Heart, ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using the same endpoint as profile for now, or a specific wishlist one if available
                const res = await http.get('/products/vendor/me').catch(() => ({ data: [] }));
                setProducts(res.data || []);
            } catch (error) {
                console.error("Error fetching wishlist:", error);
                toast.error("Không thể tải danh sách yêu thích");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const removeProduct = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setProducts(products.filter(p => p.id !== id));
        toast.success("Đã xóa khỏi danh sách yêu thích");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            <main className="pt-24 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group font-bold text-sm tracking-tight">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại Gara
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">Xe yêu thích</h1>
                        <p className="text-slate-500 font-medium text-lg">Những chiếc xe bạn đang quan tâm và theo dõi sát sao.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tổng số mục</p>
                            <p className="text-xl font-black text-slate-900">{products.length} chiếc</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-20 text-center bg-white shadow-sm min-h-[500px]">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                                <Heart className="w-10 h-10 text-slate-200" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-lg">search</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Danh sách yêu thích trống</h3>
                        <p className="text-base font-medium text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Bạn chưa lưu chiếc xe nào. Hãy khám phá các phiên đấu giá đang diễn ra và nhấn vào biểu tượng trái tim để lưu lại.</p>
                        <Link href="/categories" className="group relative px-10 py-5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/20">
                            <span className="relative z-10 flex items-center gap-3">
                                Khám phá ngay <ShoppingCart className="w-4 h-4" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col relative text-left">
                                <Link href={`/products/${product.id}`} className="block flex-1">
                                    <div className="h-64 relative overflow-hidden bg-slate-100">
                                        <img 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                            src={product.imageUrl || "/images/static/car-placeholder.png"} 
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-white/50">
                                                {product.status || 'Hợp lệ'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={(e) => removeProduct(product.id, e)}
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-500 p-3 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 border border-white/50 group/remove"
                                            title="Gỡ khỏi yêu thích"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <h3 className="font-black text-xl text-slate-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                        </div>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-black text-slate-900">{product.price.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">VND</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center gap-3 border border-slate-100/50">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Car className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{product.brand || 'Luxury'}</span>
                                            </div>
                                            <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center gap-3 border border-slate-100/50">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">speed</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{product.year || '2024'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Đang đấu giá</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                                                Đặt giá <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
