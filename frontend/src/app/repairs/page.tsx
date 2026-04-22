"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench, MapPin, CalendarClock, ShieldCheck, CheckCircle2,
  Search, Star, Clock, Phone, Car, Settings
} from "lucide-react";
import http from "@/lib/http";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RepairCapacity {
  id: number;
  name: string;
  specialty: string;
  experienceYears: number;
  vehicleTypes: string;
  district: string;
  province: string;
  contactPhone: string;
  contactName: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: string;
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

export default function RepairsPage() {
  const [capacities, setCapacities] = useState<RepairCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCapacities = async () => {
      try {
        const { data } = await http.get('/repairs/capacity/public');
        setCapacities(data);
      } catch (error) {
        console.error("Failed to fetch repair capacities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCapacities();
  }, []);

  const filteredCapacities = capacities.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.province?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      <section className="relative h-[450px] flex items-center overflow-hidden bg-slate-900 border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img
            alt="Dịch vụ sửa chữa chuyên nghiệp"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full mt-8">
          <div className="max-w-2xl">
            <span className="text-primary font-label text-sm uppercase tracking-[0.3em] font-bold mb-4 block flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-red-500" />
              <span className="text-red-400">CỨU HỘ & SỬA CHỮA LƯU ĐỘNG 24/7</span>
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-6 leading-[1.1]">
              XE GẶP SỰ CỐ DỌC ĐƯỜNG? CÓ MẶT ỨNG CỨU NGAY.
            </h1>
            <p className="text-slate-300 text-lg mb-10 font-body leading-relaxed">
              Bất kể ngày đêm, khi xế cưng gặp trục trặc, hệ thống cứu hộ sửa chữa lưu động của AutoBid luôn sẵn sàng có mặt để xử lý sự cố tận nơi. Định vị chính xác, nhanh chóng và chuyên nghiệp.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900/50 transition-all backdrop-blur-md"
                placeholder="Tìm theo chuyên môn, hãng xe (vd: Điện ô tô, Mercedes)..."
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
                Danh sách Đội cứu hộ & Chuyên gia lưu động
              </h2>
              <p className="text-slate-500 mt-2">Tìm thấy {filteredCapacities.length} đơn vị cứu hộ đang hoạt động</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl h-[400px] border border-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : filteredCapacities.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy Đội cứu hộ</h3>
              <p className="text-slate-500">Vui lòng thử lại với từ khóa khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCapacities.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <Link href={`/repairs/${item.id}`} className="block relative h-48 overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Car className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      {item.status}
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                      <Avatar className="h-12 w-12 border border-slate-200">
                        <AvatarImage src={item.profile?.user?.avatar || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{item.profile?.user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/repairs/${item.id}`}>
                          <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Được cung cấp bởi <span className="font-bold text-slate-700">{item.profile?.user?.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Wrench className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900 block mb-0.5">Chuyên môn</span>
                          {item.specialty}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900 block mb-0.5">Kinh nghiệm</span>
                          {item.experienceYears} năm làm nghề
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900 block mb-0.5">Khu vực hoạt động</span>
                          {item.province ? `${item.district ? item.district + ', ' : ''}${item.province}` : "Toàn quốc"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3 mt-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: item.profile?.user?.id } }));
                        }}
                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors text-sm text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" /> Gửi định vị / Nhắn tin
                      </button>
                      {(item.contactPhone || item.profile?.user?.phonenumber) && (
                        <a
                          href={`tel:${item.contactPhone || item.profile.user.phonenumber}`}
                          className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 hover:text-red-600 transition-colors shrink-0 border border-slate-200"
                          title="Gọi khẩn cấp"
                        >
                          <Phone className="w-5 h-5 animate-pulse" />
                        </a>
                      )}
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
