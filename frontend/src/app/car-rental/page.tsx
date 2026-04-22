"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Car, MapPin, CalendarClock, ShieldCheck, CheckCircle2, 
  Search, Star, Clock, Phone, Settings, ChevronRight
} from "lucide-react";
import http from "@/lib/http";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RentalCar {
  id: number;
  type: string;
  description: string;
  name: string;
  plate: string;
  price: number;
  status: string;
  imageUrl: string;
  profile: {
    user: {
      id: number;
      username: string;
      avatar: string;
      phonenumber: string;
      email: string;
    }
  }
}

export default function CarRentalPage() {
  const [cars, setCars] = useState<RentalCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data } = await http.get('/rental-cars/public');
        setCars(data);
      } catch (error) {
        console.error("Failed to fetch rental cars", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profile?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      <section className="relative h-[450px] flex items-center overflow-hidden bg-slate-900 border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img
            alt="Dịch vụ thuê xe cao cấp"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full mt-8">
          <div className="max-w-2xl">
            <span className="text-primary font-label text-sm uppercase tracking-[0.3em] font-bold mb-4 block flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 
                <span className="text-emerald-400">DỊCH VỤ THUÊ XE TỰ LÁI & CÓ LÁI</span>
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-6 leading-[1.1]">
              TRẢI NGHIỆM ĐẲNG CẤP VỚI MỌI HÀNH TRÌNH.
            </h1>
            <p className="text-slate-300 text-lg mb-10 font-body leading-relaxed">
              Dễ dàng lựa chọn và đặt thuê các dòng xe hiệu suất cao, xe hạng sang từ cộng đồng đối tác của AutoBid. Tự do cầm lái hoặc tận hưởng dịch vụ tài xế riêng chuyên nghiệp.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/50 transition-all backdrop-blur-md"
                    placeholder="Tìm theo tên xe, loại xe hoặc nhà cung cấp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-low min-h-[500px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
                        Danh sách xe cho thuê
                    </h2>
                    <p className="text-slate-500 mt-2">Tìm thấy {filteredCars.length} xe đang sẵn sàng phục vụ</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-[400px] border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredCars.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Car className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy xe</h3>
                    <p className="text-slate-500">Vui lòng thử lại với từ khóa khác.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCars.map((item) => (
                        <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative">
                            <div className="relative h-56 overflow-hidden bg-slate-100">
                                <img 
                                    src={item.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80"} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80' }}
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    {item.status}
                                </div>
                                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                                    {item.type}
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-headline font-bold text-2xl text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-2">{item.name}</h3>
                                <div className="text-primary font-headline text-xl font-extrabold mb-4 pb-4 border-b border-slate-100">
                                    ${item.price.toLocaleString('vi-VN')} <span className="text-sm font-body text-slate-400 font-normal">/ ngày</span>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-start gap-3 text-sm text-slate-600">
                                        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <p className="line-clamp-2 leading-relaxed">
                                            {item.description || "Chưa có mô tả chi tiết cho phương tiện này."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mt-4">
                                        <Avatar className="h-8 w-8 border border-slate-200">
                                            <AvatarImage src={item.profile?.user?.avatar || ""} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{item.profile?.user?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-0.5">Nhà cung cấp</div>
                                            <div className="font-semibold text-slate-900 line-clamp-1">{item.profile?.user?.username}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 mt-auto">
                                    <button 
                                        onClick={() => window.location.href = `/messages?vendor=${item.profile?.user?.id}`}
                                        className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm text-center shadow-lg flex items-center justify-center gap-2"
                                    >
                                        Liên hệ thuê xe <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>
    </div>
  );
}
