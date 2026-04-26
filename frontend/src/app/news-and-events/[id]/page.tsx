"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Share2, Facebook, Twitter, Link2 } from "lucide-react";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  // Mock Data
  const detail = {
    title: "CHI TIẾT TIN TỨC VÀ SỰ KIỆN AUTOBID",
    date: "05/01/2026",
    image: "/images/static/news_maybach_auction.png",
    content: [
      "Vừa qua, sự kiện trải nghiệm và đấu giá dòng xe siêu sang hoàn toàn mới đã được AutoBid tổ chức thành công rực rỡ tại trung tâm hội nghị Gem Center. Đây không chỉ là sự kiện ra mắt xe thông thường mà còn là cầu nối giữa giới thượng lưu, doanh nhân và những người đam mê tốc độ thực thụ.",
      "Xuyên suốt buổi lễ, khách mời đã được chiêm ngưỡng tận mắt công nghệ màn hình giải trí tiên tiến, hệ thống âm thanh vòm Burmester High-end 4D và khối động cơ uy lực mang đậm triết lý thiết kế đương đại. Các chuyên gia kỹ thuật hàng đầu từ hãng cũng đã có mặt để phân tích chi tiết những cải tiến vượt bậc so với phiên bản tiền nhiệm.",
      "Ngay tại không gian sự kiện, phiên đấu giá trực tiếp đã diễn ra vô cùng gay cấn với sự góp mặt của hơn 50 nhà đấu giá VIP. Mẫu xe trưng bày mang số khung đặc biệt '#001' đã được chốt với mức giá kỷ lục sau 15 lượt ra giá liên tiếp, khẳng định sức hút mãnh liệt của thương hiệu.",
      "AutoBid cam kết sẽ tiếp tục mang đến những trải nghiệm đẳng cấp quốc tế, kết hợp hài hòa giữa không nghệ số hóa và đặc quyền cá nhân hóa, giúp việc sở hữu xe lướt siêu sang trở nên minh bạch, an toàn và đầy cảm xúc."
    ]
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-24">
      
      {/* Article Hero */}
      <section className="relative h-[50vh] md:h-[60vh] bg-slate-900 w-full overflow-hidden">
        <img 
          src={detail.image} 
          alt="Cover" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay max-h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-4xl">
          <Link href="/news-and-events" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold tracking-widest uppercase transition-colors mb-6 pb-1 border-b border-white/20 hover:border-white">
            <ArrowLeft className="w-4 h-4" />
            Về Tin tức & Sự kiện
          </Link>
          <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest mb-4">
            <CalendarDays className="w-4 h-4" />
            <span>{detail.date}</span>
          </div>
          <h1 className="text-white font-headline text-3xl md:text-5xl font-extrabold leading-tight shadow-sm">
            {detail.title}
          </h1>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white relative">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          
          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed font-body">
            <p className="text-xl font-medium text-slate-900 leading-relaxed mb-8 border-l-4 border-primary pl-6">
              Ngành công nghiệp ô tô hạng sang đang chứng kiến bước chuyển mình đáng kinh ngạc trong kỷ nguyên số hóa do AutoBid tiên phong mang lại.
            </p>
            
            {detail.content.map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-line mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Share2 className="w-5 h-5" />
              Chia sẻ
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Simulation */}
      <footer className="w-full py-12 bg-slate-50 border-t border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="font-headline text-2xl font-bold mb-4">AutoBid News</div>
          <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">Trang thông tin tổng hợp cập nhật nhanh nhất thị trường ô tô.</p>
          <p className="font-body text-[10px] uppercase tracking-widest font-medium text-slate-400">© 2024 AutoBid Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
