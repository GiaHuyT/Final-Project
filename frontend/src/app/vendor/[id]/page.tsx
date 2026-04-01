"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import http from "@/lib/http";
import { Loader2, MessageCircle, Calendar, Package, BadgeCheck, ArrowLeft, Star } from "lucide-react";
import ReviewSection from "@/components/vendor/ReviewSection";

export default function VendorPublicProfilePage() {
    const params = useParams();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const { data } = await http.get(`/users/vendor/${params.id}`);
                setVendor(data);
            } catch (error) {
                console.error("Error fetching vendor:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchVendor();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-6">
                <h1 className="text-2xl font-bold mb-4 text-slate-800">Không tìm thấy Nhà cung cấp</h1>
                <Link href="/categories" className="text-blue-600 font-bold underline hover:text-blue-800">Quay lại Khám phá</Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-slate-100 pt-32 pb-16 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <Link href="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 shadow-xl border-4 border-white">
                                <img 
                                    alt={vendor.username} 
                                    src={vendor.avatar || "/images/static/user-avatar.png"} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                                <BadgeCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                                    {vendor.username}
                                </h1>
                                <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-blue-100">
                                    Đối tác Tin cậy
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm">Tham gia từ {new Date(vendor.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm">{vendor.products?.length || 0} Xe đang bán</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[1,2,3,4,5].map(i => (
                                            <Star 
                                                key={i} 
                                                className={`w-3.5 h-3.5 ${i <= Math.round(vendor.averageRating || 0) && (vendor.totalRatings || 0) > 0 ? "text-yellow-500 fill-yellow-500" : "text-slate-200"}`} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-slate-900 font-bold">
                                        {vendor.totalRatings > 0 ? vendor.averageRating?.toFixed(1) : "0.0"} 
                                        <span className="text-slate-400 font-normal ml-1">
                                            ({vendor.totalRatings || 0} đánh giá)
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => {
                                    const event = new CustomEvent('open-chat', { 
                                        detail: { vendorId: vendor.id, vendorName: vendor.username } 
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" /> Nhắn tin trực tiếp
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                {/* Profile Tabs & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Products Grid */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách xe đang niêm yết</h2>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Phổ biến nhất</span>
                                </div>
                            </div>

                            {vendor.products?.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                                    <p className="text-slate-500 font-medium">Nhà cung cấp này hiện chưa có xe nào được niêm yết.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {vendor.products.map((product: any) => (
                                        <Link 
                                            key={product.id} 
                                            href={`/products/${product.id}`}
                                            className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 block"
                                        >
                                            <div className="h-56 relative overflow-hidden bg-slate-50">
                                                <img 
                                                    alt={product.name} 
                                                    src={product.imageUrl || "/images/static/car-placeholder.png"} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                                        {product.condition || "Có sẵn"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                                                    <span>{product.year || "——"}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{product.mileage ? `${product.mileage.toLocaleString()} km` : "Mới 100%"}</span>
                                                </div>
                                                <div className="flex items-end justify-between border-t border-slate-50 pt-6">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">Giá yêu cầu</p>
                                                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                            {product.price.toLocaleString()} <span className="text-sm font-normal text-slate-500 tracking-normal">đ</span>
                                                        </p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Review Section */}
                        <ReviewSection vendorId={Number(params.id)} />
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Về Nhà cung cấp</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-8">
                                Đối tác tin cậy chuyên kinh doanh các dòng xe thể thao và xe sang tại thị trường Việt Nam. Tất cả xe đều được kiểm định nghiêm ngặt trước khi niêm yết trên AutoBid.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <BadgeCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">Xác minh</p>
                                        <p className="text-sm font-bold text-slate-900">Đã xác minh định danh</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">Uy tín</p>
                                        <p className="text-sm font-bold text-slate-900">Top 100 đối tác 2024</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-slate-50">
                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-center">Tư vấn mua xe</p>
                                    <p className="text-xl font-black text-slate-900 text-center mb-6">Sẵn sàng phản hồi 24/7</p>
                                    <button className="w-full bg-blue-600 text-white h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                                        Yêu cầu gọi lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
