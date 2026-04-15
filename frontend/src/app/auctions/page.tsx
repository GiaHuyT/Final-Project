"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import http from "@/lib/http";

export default function AuctionListingPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all"); // all, PENDING, ACTIVE, COMPLETED
  const [typeFilter, setTypeFilter] = useState("all"); // all, OFFLINE, LIVESTREAM
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await http.get('/auctions');
        const data = res.data;
        if (Array.isArray(data)) {
          setAuctions(data);
          setFilteredAuctions(data);
        }
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

  const handleApplyFilters = () => {
    let result = [...auctions];

    // Status filter
    if (statusFilter !== "all") {
        if (statusFilter === 'PENDING') {
            result = result.filter(a => a.status === 'PENDING');
        } else if (statusFilter === 'ACTIVE') {
            result = result.filter(a => a.status === 'ACTIVE' || a.status === 'WAITING_PAYMENT');
        } else if (statusFilter === 'COMPLETED') {
            result = result.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');
        }
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(a => a.type === typeFilter);
    }

    // Date filter
    if (fromDate) {
      result = result.filter(a => new Date(a.startTime).getTime() >= new Date(fromDate).getTime());
    }
    if (toDate) {
       // end of day for toDate
       const endToDate = new Date(toDate);
       endToDate.setHours(23, 59, 59, 999);
      result = result.filter(a => new Date(a.endTime).getTime() <= endToDate.getTime());
    }

    setFilteredAuctions(result);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setFromDate("");
    setToDate("");
    setFilteredAuctions(auctions);
  };

  const getTimeLeft = (startTime: string, endTime: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return "ĐÃ KẾT THÚC";

    const startMs = new Date(startTime).getTime();
    if (now < startMs) {
      const distance = startMs - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (days > 0) return `Bắt đầu sau ${days}ngày ${hours}g`;
      return `Bắt đầu sau: ${hours.toString().padStart(2, '0')}g ${minutes.toString().padStart(2, '0')}p ${seconds.toString().padStart(2, '0')}giây`;
    }

    if (!endTime) return "ĐÃ KẾT THÚC";
    const distance = new Date(endTime).getTime() - now;
    if (distance < 0) return "ĐÃ KẾT THÚC";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) return `Còn lại: ${days}ngày ${hours}g ${minutes}p`;
    return `Còn lại: ${hours.toString().padStart(2, '0')}g ${minutes.toString().padStart(2, '0')}p ${seconds.toString().padStart(2, '0')}giây`;
  };

  const activeRadioClasses = "bg-[#6c4826] text-white";
  const inactiveRadioClasses = "bg-white border-slate-300";

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-surface-container-highest min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-24">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background italic mb-8">Sàn giao dịch Đấu Giá</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT BỘ LỌC (Sidebar Filter) */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-surface-container-low rounded-xl p-6 shadow-sm sticky top-24 border border-outline/10">
              
              {/* Trạng thái */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Trạng thái</h3>
                <div className="space-y-3">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'PENDING', label: 'Sắp diễn ra' },
                    { id: 'ACTIVE', label: 'Đang diễn ra' },
                    { id: 'COMPLETED', label: 'Đã kết thúc' }
                  ].map(option => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${statusFilter === option.id ? 'border-primary' : 'border-outline group-hover:border-primary'}`}>
                            {statusFilter === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                        <input type="radio" className="hidden" name="status" value={option.id} checked={statusFilter === option.id} onChange={(e) => setStatusFilter(e.target.value)} />
                        <span className="text-sm font-medium text-on-surface-variant">{option.label}</span>
                      </label>
                  ))}
                </div>
              </div>

              {/* Hình thức */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Hình thức</h3>
                <div className="space-y-3">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'OFFLINE', label: 'Trả giá ngoài' },
                    { id: 'LIVESTREAM', label: 'Phiên Livestream' }
                  ].map(option => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${typeFilter === option.id ? 'border-primary' : 'border-outline group-hover:border-primary'}`}>
                            {typeFilter === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                        <input type="radio" className="hidden" name="type" value={option.id} checked={typeFilter === option.id} onChange={(e) => setTypeFilter(e.target.value)} />
                        <span className="text-sm font-medium text-on-surface-variant">{option.label}</span>
                      </label>
                  ))}
                </div>
              </div>

              {/* Từ ngày */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-on-surface mb-2">Từ ngày</h3>
                <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-surface border border-outline rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Đến ngày */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-on-surface mb-2">Đến ngày</h3>
                <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-surface border border-outline rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleApplyFilters}
                  className="w-full bg-primary hover:opacity-90 text-on-primary font-bold py-3 px-4 rounded-full transition-all"
                >
                  Áp dụng
                </button>
                <button 
                  onClick={handleClearFilters}
                  className="w-full text-on-surface-variant hover:text-on-surface font-medium py-2 px-4 rounded-full transition-colors"
                >
                  Xoá bộ lọc
                </button>
              </div>

            </div>
          </aside>

          {/* CỘT MAIN (Danh sách đấu giá) */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low border border-outline/10 rounded-2xl">
                <p className="text-on-surface-variant font-bold text-lg">Không tìm thấy phiên đấu giá nào phù hợp.</p>
                <button onClick={handleClearFilters} className="text-primary underline text-sm mt-2">Xoá lọc và xem tất cả</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredAuctions.map((auction) => {
                  const timeLeft = getTimeLeft(auction.startTime, auction.endTime, auction.status);
                  const isEnded = timeLeft === "ĐÃ KẾT THÚC";
                  const isPending = timeLeft.startsWith("Bắt đầu");
                  const coverImage = auction.items?.[0]?.product?.images?.[0]?.url || "/images/static/car-placeholder.png";

                  return (
                    <div key={auction.id} className="group bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                      <Link href={`/auctions/${auction.id}`} className="block relative h-64 overflow-hidden">
                        <img alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={coverImage} />
                        
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md
                            ${auction.status === 'ACTIVE' ? 'bg-primary text-on-primary shadow-[0_0_8px_rgba(0,0,0,0.3)]' : 'bg-black/80 text-white'}
                          `}>
                            {auction.type === 'LIVESTREAM' ? '🔴 Live' : 'Offline'}
                          </span>
                        </div>
                      </Link>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-headline text-xl font-bold text-on-surface line-clamp-2 mb-3 h-14" title={auction.title}>{auction.title}</h3>
                        
                        <div className="mt-auto space-y-4">
                            <div className="bg-surface-container-low p-4 rounded-xl flex justify-between items-center border border-outline/5 border-b-[2px] border-b-primary">
                                <div>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Giá hiện tại</p>
                                <p className="text-2xl font-black text-primary">
                                    {(auction.currentPrice || auction.startPrice).toLocaleString('vi-VN')} đ
                                </p>
                                </div>
                                <div className="text-right">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Bắt đầu lúc</p>
                                <p className="text-sm font-semibold text-on-surface">{format(new Date(auction.startTime), "dd/MM HH:mm")}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 px-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-outline text-sm">schedule</span>
                                  <p className={`text-sm font-bold ${isEnded ? 'text-error' : (isPending ? 'text-orange-500' : 'text-on-tertiary-container')}`}>
                                      {isEnded ? "Đã kết thúc" : timeLeft}
                                  </p>
                                </div>
                            </div>

                            <Link href={`/auctions/${auction.id}`} className={`block w-full text-center py-4 mt-2 rounded-full font-headline font-bold text-sm tracking-widest transition-all ${isEnded ? 'bg-surface-variant text-on-surface-variant hover:opacity-90' : 'bg-primary text-on-primary hover:opacity-90 active:scale-95'}`}>
                            {isEnded ? "XEM KẾT QUẢ" : "THAM GIA NGAY"}
                            </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
