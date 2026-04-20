"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Share2, Facebook, Twitter, Link2 } from "lucide-react";

export default function OfferDetailPage({ params }: { params: { id: string } }) {
  // Mock Data (In a real app, fetch based on params.id)
  const detail = {
    title: "CHI TIẾT CHƯƠNG TRÌNH ƯU ĐÃI AUTOBID",
    date: "01/01/2026",
    image: "/images/static/offer_new_year.png",
    content: [
      "Nhằm tri ân khách hàng đã đồng hành cùng AutoBid trong suốt thời gian qua, chúng tôi chính thức triển khai chương trình ưu đãi đặc quyền với tổng giá trị chưa từng có trên nền tảng. Đây là cơ hội vàng để các nhà sưu tầm và tay chơi xe thứ thiệt nâng cấp không gian gara của mình với những cỗ máy tốc độ hàng đầu.",
      "Cụ thể, khách hàng khi tham gia nền tảng và trúng đấu giá bất kỳ sản phẩm xe thuộc phân khúc Luxury Class (Mercedes-Benz S-Class, BMW 7-Series, Porsche Panamera...) sẽ lập tức nhận được những đặc quyền sau:",
      "- Tặng gói bảo hiểm vật chất cao cấp trị giá 2 năm tối đa 100 triệu đồng.\n- Tặng thẻ thành viên thẻ Platinum AutoBid Privilege miễn phí tham gia các phòng VIP trong 24 tháng.\n- Voucher bảo dưỡng toàn diện trị giá 50 triệu đồng áp dụng tại hệ thống Service x AutoBid toàn quốc.",
      "Chương trình áp dụng từ nay cho đến hết tháng, số lượng giới hạn cho 50 giao dịch thành công đầu tiên. Mọi thắc mắc xin vui lòng liên hệ hotline tổng đài hoặc nhấn nút Đăng ký tư vấn góc phải."
    ]
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      
      {/* Article Hero */}
      <section className="relative h-[50vh] md:h-[60vh] bg-slate-900 w-full overflow-hidden">
        <img 
          src={detail.image} 
          alt="Cover" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay max-h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-4xl">
          <Link href="/offers" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold tracking-widest uppercase transition-colors mb-6 pb-1 border-b border-white/20 hover:border-white">
            <ArrowLeft className="w-4 h-4" />
            Về danh sách ưu đãi
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
              Đừng bỏ lỡ cơ hội sở hữu chiếc xe trong mơ của bạn với những ưu đãi tài chính và dịch vụ độc quyền hiếm có từ bộ phận kinh doanh AutoBid.
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
