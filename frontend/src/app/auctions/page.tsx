"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";

export default function AuctionListingPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data } = await http.get('/products?type=AUCTION');
        setAuctions(data || []);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeLeft = (endTime: string) => {
    const distance = new Date(endTime).getTime() - now;
    if (distance < 0) return "ĐÃ KẾT THÚC";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) return `${days}ngày ${hours}g ${minutes}p`;
    return `${hours.toString().padStart(2, '0')}g ${minutes.toString().padStart(2, '0')}p ${seconds.toString().padStart(2, '0')}giây`;
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-surface-container-highest min-h-screen">


      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-on-tertiary-container font-label text-xs uppercase tracking-[0.2em] font-bold mb-2 block">Sàn giao dịch</span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background italic">Đang đấu giá</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="glass-panel px-4 py-2 rounded-full border border-outline/10 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Lọc
             </div>
             <div className="glass-panel px-4 py-2 rounded-full border border-outline/10 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-sm">sort</span>
                Sắp xếp: Mới nhất
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl">
            <p className="text-on-surface-variant font-bold text-lg">Không tìm thấy xe nào.</p>
            <p className="text-sm text-outline mt-2">Vui lòng quay lại sau để xem các mẫu xe mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {auctions.map((product) => {
              const timeLeft = getTimeLeft(product.auction?.endTime || "");
              const isEndingSoon = timeLeft !== "ĐÃ KẾT THÚC" && !timeLeft.includes('ngày');

              return (
                <div key={product.id} className="group cursor-pointer">
                  <Link href={`/auctions/${product.id}`}>
                    <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-surface-container">
                      <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.imageUrl || "/images/static/car-placeholder.png"} />

                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest">Đang đấu giá</span>
                        {isEndingSoon && (
                          <span className="bg-tertiary-container/80 text-on-tertiary-container text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest">Sắp kết thúc</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline text-xl font-bold line-clamp-1">{product.name}</h3>
                      <span className="material-symbols-outlined text-outline cursor-pointer hover:text-error transition-colors">favorite</span>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1.5 bg-secondary-container px-3 py-1 rounded-md">
                        <span className="material-symbols-outlined text-sm">speed</span>
                        <span className="text-xs font-bold text-on-secondary-container">{product.mileage || '0'} dặm</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-secondary-container px-3 py-1 rounded-md">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-xs font-bold text-on-secondary-container">USA</span>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Giá hiện tại</p>
                          <p className="font-headline text-2xl font-extrabold text-primary">${product.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Thời gian còn</p>
                          <p className={`font-headline text-lg font-bold ${isEndingSoon ? 'text-on-tertiary-container' : 'text-on-background'}`}>{timeLeft}</p>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-surface-variant rounded-full mt-4 overflow-hidden">
                        <div className={`h-full ${isEndingSoon ? 'bg-tertiary shadow-[0_0_8px_rgba(0,0,0,0.3)]' : 'bg-primary'} transition-all`} style={{ width: isEndingSoon ? '85%' : '30%' }}></div>
                      </div>
                    </div>
                    <Link href={`/auctions/${product.id}`} className="block text-center w-full mt-6 bg-primary text-on-primary py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:opacity-90 active:scale-95 transition-all">
                      ĐẶT GIÁ
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

