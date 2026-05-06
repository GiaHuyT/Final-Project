"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import http from "@/lib/http";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { initSocket, disconnectSocket } from '@/lib/socket';

export default function AuctionListingPage() {
  const { user, isLoggedIn, token } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [processingAction, setProcessingAction] = useState<number | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all"); // all, PENDING, ACTIVE, COMPLETED
  const [typeFilter, setTypeFilter] = useState("all"); // all, OFFLINE, LIVESTREAM
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAuctions = async () => {
    try {
      const res = await http.get('/auctions', { params: { t: Date.now() } });
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

  useEffect(() => {
    fetchAuctions();
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Socket listener cho real-time updates
  useEffect(() => {
    if (isLoggedIn && token && user?.id) {
       const socket = initSocket('notifications', token, user.id);
       const handleNotification = (data: any) => {
           if (data?.type === 'AUCTION') {
               // Có thao tác liên quan tới đấu giá (Duyệt/Từ chối), load lại DS
               fetchAuctions();
           }
       };
       socket.on('notification', handleNotification);
       
       return () => {
           socket.off('notification', handleNotification);
       }
    }
  }, [isLoggedIn, token, user?.id]);

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

  const handleRegisterClick = async (auction: any) => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để đăng ký tham gia đấu giá!');
      router.push('/auth/login?redirect=/auctions');
      return;
    }
    
    if (auction.vendorId === user?.id) {
        toast.error('Bạn là chủ sở hữu phiên đấu giá này.');
        return;
    }

    try {
      setProcessingAction(auction.id);
      await http.post(`/auctions/${auction.id}/register`);
      toast.success('Đã gửi yêu cầu đăng ký tham gia!');
      const currentUserId = user?.id || user?.userId || user?.sub;
      // Update local state temporarily
      const updatedAuctions = auctions.map(a => {
        if (a.id === auction.id) {
            const updatedRegs = [...(a.registrations || []), { userId: currentUserId, status: 'PENDING' }];
            return { ...a, registrations: updatedRegs };
        }
        return a;
      });
      setAuctions(updatedAuctions);
      
      const updatedFiltered = filteredAuctions.map(a => {
        if (a.id === auction.id) {
            const updatedRegs = [...(a.registrations || []), { userId: currentUserId, status: 'PENDING' }];
            return { ...a, registrations: updatedRegs };
        }
        return a;
      });
      setFilteredAuctions(updatedFiltered);

    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg === 'Bạn đã gửi yêu cầu đăng ký cho phiên này rồi.') {
        // Fallback: If backend says already registered, update the UI to match
        toast.success('Bạn đã đăng ký tham gia phiên này!');
        const currentUserId = user?.id || user?.userId || user?.sub;
        const updatedAuctions = auctions.map(a => {
          if (a.id === auction.id) {
              const updatedRegs = [...(a.registrations || []), { userId: currentUserId, status: 'PENDING' }];
              return { ...a, registrations: updatedRegs };
          }
          return a;
        });
        setAuctions(updatedAuctions);
        setFilteredAuctions(updatedAuctions);
        fetchAuctions(); // trigger a fresh fetch
      } else {
        toast.error(msg || 'Có lỗi xảy ra khi đăng ký!');
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const getTimeLeft = (startTime: string, endTime: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'WAITING_PAYMENT') return "ĐÃ KẾT THÚC";

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredAuctions.map((auction, index) => {
                  const timeLeft = getTimeLeft(auction.startTime, auction.endTime, auction.status);
                  const isEnded = timeLeft === "ĐÃ KẾT THÚC";
                  const isPending = timeLeft.startsWith("Bắt đầu");
                  
                  const placeholders = [
                    "/images/static/category-sedan.png",
                    "/images/static/category-suv.png",
                    "/images/static/category-exotic.png",
                    "/images/static/category-electric.png",
                    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
                  ];
                  const fallbackImage = placeholders[index % placeholders.length];
                  const coverImage = auction.items?.[0]?.product?.images?.[0]?.url || fallbackImage;
                  const currentUserId = user?.id || user?.userId || user?.sub;
                  const myReg = auction.registrations?.find((r: any) => {
                      const rId = r.userId || r.user?.id;
                      return rId?.toString() === currentUserId?.toString();
                  });
                  
                  return (
                    <div key={auction.id} className="group bg-surface-container rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                      <Link href={`/auctions/${auction.id}`} className="block relative h-64 overflow-hidden">
                        <img alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={coverImage} />
                        
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md
                              ${auction.status === 'ACTIVE' ? 'bg-primary text-on-primary shadow-[0_0_8px_rgba(0,0,0,0.3)]' : 'bg-black/80 text-white'}
                            `}>
                              {auction.type === 'LIVESTREAM' ? '🔴 Live' : 'onlline'}
                            </span>
                          </div>
                          {myReg?.status === 'BANNED' && (
                              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.8)] border border-red-400 w-max">
                                  🚫 CẤM THAM GIA
                              </span>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-headline text-xl font-bold text-on-surface line-clamp-2 mb-3 h-14" title={auction.title}>{auction.title}</h3>
                        
                        <div className="mt-auto space-y-4">
                            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between gap-4 border border-outline/5 border-b-[2px] border-b-primary">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Giá hiện tại</p>
                                    <p className="text-xl font-black text-primary truncate" title={`${(auction.currentPrice || auction.startPrice).toLocaleString('vi-VN')} đ`}>
                                        {(auction.currentPrice || auction.startPrice).toLocaleString('vi-VN')} đ
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Bắt đầu lúc</p>
                                    <p className="text-sm font-semibold text-on-surface whitespace-nowrap">{format(new Date(auction.startTime), "dd/MM HH:mm")}</p>
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

                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Link href={`/auctions/${auction.id}`} className="block w-full text-center py-3 rounded-full font-headline font-bold text-sm tracking-widest transition-all bg-surface border border-primary text-primary hover:bg-primary/5 active:scale-95">
                                    XEM TRƯỚC
                                </Link>
                                
                                {isEnded ? (
                                    <Link href={`/auctions/${auction.id}`} className="block w-full text-center py-3 rounded-full font-headline font-bold text-sm tracking-widest transition-all bg-surface-variant text-on-surface-variant hover:opacity-90">
                                        KẾT QUẢ
                                    </Link>
                                ) : auction.vendorId === user?.id ? (
                                    <Link href={`/vendor/auctions/${auction.id}/registrations`} className="block w-full text-center py-3 rounded-full font-headline font-bold text-sm tracking-widest transition-all bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95">
                                        QUẢN LÝ
                                    </Link>
                                ) : (
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (myReg?.status === 'APPROVED') {
                                                router.push(`/auctions/${auction.id}`);
                                            } else if (myReg?.status !== 'BANNED') {
                                                handleRegisterClick(auction);
                                            }
                                        }}
                                        disabled={myReg?.status === 'PENDING' || myReg?.status === 'REGISTERED' || myReg?.status === 'REJECTED' || myReg?.status === 'BANNED' || processingAction === auction.id}
                                        className={`block w-full text-center py-3 flex items-center justify-center rounded-full font-headline font-bold text-sm tracking-widest transition-all ${
                                            myReg?.status === 'APPROVED' ? 'bg-primary text-on-primary hover:opacity-90' :
                                            (myReg?.status === 'PENDING' || myReg?.status === 'REGISTERED') ? 'bg-orange-500 text-white opacity-80 cursor-not-allowed' :
                                            myReg?.status === 'REJECTED' ? 'bg-error text-white opacity-80 cursor-not-allowed' :
                                            myReg?.status === 'BANNED' ? 'bg-slate-800 text-red-500 opacity-90 cursor-not-allowed border border-red-900/50' :
                                            'bg-primary text-on-primary hover:opacity-90 active:scale-95'
                                        }`}
                                    >
                                        {processingAction === auction.id ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : myReg?.status === 'APPROVED' ? "THAM GIA NGAY" :
                                          (myReg?.status === 'PENDING' || myReg?.status === 'REGISTERED') ? "ĐANG CHỜ" :
                                          myReg?.status === 'REJECTED' ? "BỊ TỪ CHỐI" :
                                          myReg?.status === 'BANNED' ? "ĐÃ BỊ CẤM" :
                                          "ĐĂNG KÝ"}
                                    </button>
                                )}
                            </div>
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
