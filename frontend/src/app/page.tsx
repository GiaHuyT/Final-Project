"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import http from "@/lib/http";

export default function Home() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=2070", // Porsche 911 grey
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2070", // Ferrari red
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2069", // Lamborghini yellow
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2070", // McLaren blue
    "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2070", // Aston Martin green
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80&w=2070", // Orange sports car
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=2072", // Colorful custom
    "https://images.unsplash.com/photo-1555353540-64fd1ebac773?auto=format&fit=crop&q=80&w=2070"  // McLaren orange
  ];

  useEffect(() => {
    http.get('/products?type=AUCTION&status=ACTIVE')
      .then(res => {
        setAuctions(res.data.slice(0, 3)); // Display top 3 for the home page sections
      })
      .catch(err => console.error("Error fetching auctions:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-surface-container-highest min-h-screen">


      <main className="pt-16">
        {/* Hero Search Section */}
        <section className="relative h-[870px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black">
            {heroImages.map((src, index) => (
              <img
                key={index}
                alt={`Hero Car ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === currentHeroIndex ? "opacity-100" : "opacity-0"
                }`}
                src={src}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-on-background/90 via-on-background/40 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl">
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-[0.9]">
                CỖ MÁY DÀNH CHO <br /> GIỚI <span className="text-tertiary-fixed-dim">TINH HOA.</span>
              </h1>
              <p className="text-surface-variant text-lg md:text-xl mb-10 max-w-md font-body leading-relaxed">
                Truy cập các phiên đấu giá ô tô độc quyền. Kho xe được kiểm định khắt khe dành cho người đam mê sưu tầm.
              </p>
              {/* Search Bar Component */}
              <div className="glass-panel p-2 rounded-full flex items-center shadow-2xl max-w-xl group focus-within:ring-2 ring-primary/20 transition-all">
                <span className="material-symbols-outlined ml-4 text-on-surface-variant">search</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-medium px-4 placeholder:text-on-surface-variant/60 outline-none" placeholder="Tìm kiếm theo hãng, mẫu xe hoặc năm..." type="text" />
                <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold text-sm tracking-wide active:scale-95 transition-transform">
                  TÌM XE
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentHeroIndex 
                    ? "bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                    : "bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Categories Section (Bento Grid Style) */}

        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-on-tertiary-container font-label text-xs uppercase tracking-[0.2em] font-bold mb-2 block">Bộ sưu tập</span>
                <h2 className="font-headline text-4xl font-bold tracking-tight text-on-background">Danh mục xe</h2>
              </div>
              <Link className="text-sm font-bold border-b-2 border-primary pb-1 flex items-center gap-2 group" href="/categories">
                Xem tất cả mẫu xe
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[600px]">
              {/* Large Category */}
              <div className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group cursor-pointer bg-slate-200 min-h-[300px]">
                <img alt="Luxury Sedans" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/static/category-sedan.png" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white font-headline text-3xl font-bold">Sedan Hạng Sang</h3>
                  <p className="text-white/70 text-sm mt-2">124 Phiên đấu giá</p>
                </div>
              </div>
              {/* Small Category 1 */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer bg-slate-200 min-h-[150px]">
                <img alt="SUVs" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/static/category-suv.png" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-headline text-xl font-bold">SUV Hiệu Năng Cao</h3>
                </div>
              </div>
              {/* Small Category 2 */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer bg-slate-200 min-h-[150px]">
                <img alt="Electric" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/static/category-electric.png" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-headline text-xl font-bold">Thế Hệ Điện Tương Lai</h3>
                </div>
              </div>
              {/* Wide Category */}
              <div className="md:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer bg-slate-200 min-h-[150px]">
                <img alt="Exotics" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/static/category-exotic.png" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white font-headline text-2xl font-bold">Siêu Xe Hiếm</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Auctions Section */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-3 w-3 rounded-full bg-error animate-pulse"></div>
              <h2 className="font-headline text-4xl font-bold tracking-tight">Đang đấu giá</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
              </div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-3xl">
                <p className="text-on-surface-variant font-bold">Hiện chưa có phiên đấu giá nào đang diễn ra.</p>
                <Link href="/auctions" className="text-primary underline mt-2 block">Xem tất cả xe</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {auctions.map((product) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-surface-container">
                        <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.imageUrl || "/images/static/car-placeholder.png"} />

                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest">Đang đấu giá</span>
                          {/* Add logic for ending soon if needed */}
                        </div>
                      </div>
                    </Link>
                    <div className="px-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline text-xl font-bold truncate pr-4">{product.name}</h3>
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
                          {/* Time left logic could go here */}
                        </div>
                        {/* Progress Bar placeholder */}
                        <div className="w-full h-1 bg-surface-variant rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-primary w-1/4"></div>
                        </div>
                      </div>
                      <Link href={`/products/${product.id}`} className="block text-center w-full mt-6 bg-primary text-on-primary py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:opacity-90 active:scale-95 transition-all">
                        XEM ĐẤU GIÁ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Selling CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="relative bg-on-background rounded-[2rem] overflow-hidden p-12 md:p-24 flex flex-col md:flex-row items-center gap-12">
              <div className="relative z-10 flex-1">
                <span className="text-tertiary-fixed-dim font-label text-xs uppercase tracking-[0.2em] font-bold mb-4 block">Dịch vụ cho người bán</span>
                <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-8 leading-tight">
                  ĐĂNG BÁN XE TRÊN HỆ THỐNG.
                </h2>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-surface-variant">
                    <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                    Hỗ trợ chụp ảnh studio chuyên nghiệp
                  </li>
                  <li className="flex items-center gap-3 text-surface-variant">
                    <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                    Tiếp cận hơn 1.2M người tham gia đấu giá
                  </li>
                  <li className="flex items-center gap-3 text-surface-variant">
                    <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                    Đội ngũ chuyên viên đấu giá tận tâm
                  </li>
                </ul>
                <button className="bg-white text-on-background px-10 py-5 rounded-full font-headline font-black text-sm tracking-widest active:scale-95 transition-transform">
                  BẮT ĐẦU BÁN
                </button>
              </div>
              <div className="flex-1 w-full md:w-auto h-[400px] relative rounded-3xl overflow-hidden shadow-2xl">
                <img alt="Luxury Car Showroom" className="w-full h-full object-cover" src="/images/static/showroom.png" />

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <div className="text-xl font-bold text-slate-900 font-headline mb-4">AutoBid</div>
            <p className="text-slate-500 max-w-sm text-sm">Nền tảng đấu giá kỹ thuật số hàng đầu thế giới dành cho các mẫu xe hiệu suất cao và xe hạng sang.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-body text-xs uppercase tracking-widest font-bold mb-6 text-slate-900">Thị trường</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Điều khoản dịch vụ</Link></li>
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Chính sách bảo mật</Link></li>
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Quy tắc đấu giá</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-body text-xs uppercase tracking-widest font-bold mb-6 text-slate-900">Tài nguyên</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Hướng dẫn mua</Link></li>
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Hướng dẫn bán</Link></li>
                <li><Link className="text-slate-500 hover:text-primary transition-colors duration-300" href="#">Liên hệ hỗ trợ</Link></li>
              </ul>
            </div>
            <div className="col-span-2">
              <h4 className="font-body text-xs uppercase tracking-widest font-bold mb-6 text-slate-900">Bản tin</h4>
              <div className="flex max-w-md">
                <input className="bg-white border-none rounded-l-full px-6 w-full text-sm focus:ring-0" placeholder="Địa chỉ Email" type="email" />
                <button className="bg-primary text-on-primary px-6 py-3 rounded-r-full font-bold text-xs uppercase tracking-widest">Tham gia</button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-[10px] uppercase tracking-widest font-medium text-slate-500">© 2024 AutoBid Precision Engine. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">brand_awareness</span>
              <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">public</span>
              <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">share</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
