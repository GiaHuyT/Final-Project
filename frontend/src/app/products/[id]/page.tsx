"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import http from "@/lib/http";
import { VendorChatButton } from "@/components/chat/VendorChatButton";

export default function VehicleDetailsPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidValue, setBidValue] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await http.get(`/products/${params.id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-surface p-6">
        <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
        <Link href="/auctions" className="text-primary font-bold underline">Return to Auctions</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-surface-container-highest min-h-screen">


      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-12">
            <Link href="/">Trang chủ</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href="/auctions">Đấu giá</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary italic">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8">
             <h1 className="font-headline text-5xl font-black tracking-tighter text-on-background mb-4 leading-none uppercase italic">
                {product.name}
             </h1>
             <p className="text-on-surface-variant font-medium text-lg mb-8">
               {product.engineCapacity || '—'}L {product.fuelType || '—'}, {product.transmission || '—'}, {product.mileage?.toLocaleString() || '0'} Miles
             </p>

             {/* Gallery */}
             <div className="space-y-6 mb-16">
                <div className="aspect-[16/9] rounded-[2rem] overflow-hidden bg-surface-container">
                    <img alt={product.name} className="w-full h-full object-cover" src={product.imageUrl || "/images/static/car-porsche.png"} />


                </div>
                {product.images?.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-surface-container">
                        <img alt={`${product.name} detail ${idx + 1}`} className="w-full h-full object-cover" src={img} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container">
                      <img alt="Detail 1" className="w-full h-full object-cover" src="/images/static/detail-steering.png" />
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container">
                      <img alt="Detail 2" className="w-full h-full object-cover" src="/images/static/detail-wheel.png" />
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container">
                      <img alt="Detail 3" className="w-full h-full object-cover" src="/images/static/category-exotic.png" />
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative">
                      <img alt="Detail 4" className="w-full h-full object-cover opacity-60" src="/images/static/category-sedan.png" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-on-background font-bold">+24 Ảnh</span>
                      </div>
                    </div>
                  </div>
                )}

             </div>

             {/* Description */}
             <div className="space-y-8 mb-16">
                <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-outline/10">Tổng quan xe</h2>
                <p className="text-on-surface leading-loose text-lg whitespace-pre-line">
                   {product.description || "Chưa có mô tả cho mẫu xe này."}
                </p>
             </div>

             {/* Detailed Specs */}
             <div className="space-y-8">
                <h2 className="font-headline text-3xl font-bold tracking-tight pb-4 border-b border-outline/10">Thông số kỹ thuật</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Động cơ</p>
                      <p className="font-headline font-bold text-lg">{product.engineCapacity}L {product.fuelType}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Công suất</p>
                      <p className="font-headline font-bold text-lg">{product.maxPower || '—'} hp</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Momen xoắn</p>
                      <p className="font-headline font-bold text-lg">{product.maxTorque || '—'} Nm</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Hộp số</p>
                      <p className="font-headline font-bold text-lg">{product.transmission || '—'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Hệ dẫn động</p>
                      <p className="font-headline font-bold text-lg">{product.driveType || '—'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Màu sắc</p>
                      <p className="font-headline font-bold text-lg">{product.color || '—'}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
             <div className="bg-surface-container-low rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
                <div className="mb-10 text-center">
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Giá cao nhất hiện tại</p>
                   <p className="font-headline text-5xl font-black text-primary">${product.price.toLocaleString()}</p>
                </div>
                
                <div className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl mb-8">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase">Thời gian còn</span>
                      <span className="font-headline font-bold text-lg text-on-tertiary-container">2ngày 14g 55p</span>
                   </div>
                   <div className="h-10 w-px bg-outline/10"></div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase">Lượt ra giá</span>
                      <span className="font-headline font-bold text-lg">12 Lượt</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 p-2 bg-white rounded-full border border-outline/10 focus-within:ring-2 ring-primary/20 transition-all">
                     <span className="flex items-center pl-4 font-headline font-bold text-sm">$</span>
                     <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold outline-none" 
                      placeholder={(product.price + 500).toLocaleString()} 
                      type="number"
                      value={bidValue}
                      onChange={(e) => setBidValue(e.target.value)}
                     />
                  </div>
                  <button className="w-full bg-primary text-on-primary py-5 rounded-full font-headline font-black text-sm tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-slate-200">
                    ĐẶT GIÁ CỦA BẠN
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-outline/10">
                   <p className="text-[10px] font-bold text-center text-on-surface-variant uppercase tracking-widest mb-6">Người bán đã xác minh</p>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            <img alt="Seller" src="/images/static/user-avatar.png" />

                         </div>
                         <div>
                            <p className="text-sm font-bold">{product.vendor?.username || "Người bán uy tín"}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">98% Đánh giá Tích cực</p>
                         </div>
                      </div>
                      <VendorChatButton vendorId={product.vendorId} productId={product.id} />
                   </div>
                </div>
             </div>

             <div className="mt-8 px-6">
                <div className="flex items-center gap-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed">
                   <span className="material-symbols-outlined text-sm">security</span>
                   Giao dịch của bạn được bảo đảm an toàn bởi các dịch vụ ủy thác và kiểm định vận chuyển độc lập.
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

