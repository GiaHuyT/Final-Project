"use client";

import React from "react";
import Link from "next/link";
import { 
  Briefcase, Clock, ShieldCheck, Star, CalendarClock, 
  MapPin, CheckCircle2, ChevronRight, UserCircle2, Award
} from "lucide-react";

export default function DriverRentalPage() {
  const features = [
    {
      title: "Chuyên môn nghiệp vụ cao",
      description: "100% tài xế đều vượt qua khóa huấn luyện lái xe an toàn nâng cao và quy chuẩn phục vụ VIP.",
      icon: <Award className="w-8 h-8 text-primary" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Riêng tư & Bảo mật tuyệt đối",
      description: "Cam kết giữ bí mật mọi thông tin và lịch trình của khách hàng với chuẩn mực đạo đức nghề nghiệp cao nhất.",
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Đúng giờ & Linh hoạt",
      description: "Luôn có mặt trước 15 phút. Sẵn sàng thay đổi lộ trình theo yêu cầu đột xuất của khách hàng.",
      icon: <Clock className="w-8 h-8 text-primary" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Phong cách chuẩn mực",
      description: "Tác phong chuyên nghiệp, trang phục lịch sự (suit/vest theo yêu cầu), giao tiếp nhã nhặn đa ngôn ngữ.",
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
    }
  ];

  const packages = [
    {
      title: "Gói theo giờ (City Tour)",
      price: "$20",
      unit: "/ giờ",
      desc: "Lựa chọn tối ưu cho các buổi gặp gỡ đối tác, dự tiệc hoặc di chuyển linh hoạt trong nội thành.",
      features: ["Thời gian thuê tối thiểu: 4 giờ", "Hỗ trợ chờ không tính phí (dưới 30 phút)", "Bao gồm chi phí cầu đường nội thành"]
    },
    {
      title: "Gói Theo Ngày (Business)",
      price: "$150",
      unit: "/ ngày",
      desc: "Giải pháp hoàn hảo cho các chuyến công tác xa, đi tỉnh hoặc lịch trình công việc dày đặc cả ngày.",
      features: ["Giới hạn: 10 giờ làm việc/ngày", "Hỗ trợ lộ trình liên tỉnh", "Có thể gia hạn thêm giờ linh hoạt"],
      isPopular: true
    },
    {
      title: "Đưa Đón Sân Bay VIP",
      price: "$50",
      unit: "/ lượt",
      desc: "Dịch vụ đón tiễn chuẩn 5 sao tại sảnh sân bay, hỗ trợ hành lý và làm thủ tục nhanh chóng.",
      features: ["Bảng tên đón khách tại sảnh", "Hỗ trợ hành lý lên/xuống xe", "Miễn phí thời gian chờ do chuyến bay delay"]
    }
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            alt="Dịch vụ lái xe chuyên nghiệp"
            className="w-full h-full object-cover opacity-60"
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <span className="text-primary font-label text-sm uppercase tracking-[0.3em] font-bold mb-4 block">Chauffeur Service</span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-[1.1]">
              DỊCH VỤ TÀI XẾ <br /> ĐẲNG CẤP THƯƠNG GIA.
            </h1>
            <p className="text-slate-300 text-lg mb-10 font-body leading-relaxed">
              Tận hưởng sự thư thái tuyệt đối trên băng ghế sau. Đội ngũ tài xế riêng được đào tạo bài bản của AutoBid sẽ mang đến cho bạn một hành trình an toàn, êm ái và đúng giờ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                ĐẶT TÀI XẾ NGAY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900">
              Chuẩn Mực Phục Vụ 5 Sao
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Không chỉ là người cầm lái, mỗi tài xế của AutoBid là một trợ lý hành trình chuyên nghiệp, hiểu rõ giá trị của sự đúng giờ và tính bảo mật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Packages */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="text-primary font-label text-sm uppercase tracking-[0.2em] font-bold mb-2 block">Bảng giá dịch vụ</span>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900">
              Các Gói Tài Xế Tiêu Chuẩn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, idx) => (
              <div key={idx} className={`relative bg-white rounded-3xl p-8 flex flex-col ${pkg.isPopular ? 'border-2 border-primary shadow-xl scale-105 z-10' : 'border border-slate-200 shadow-sm'}`}>
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Phổ Biến Nhất
                  </div>
                )}
                <h3 className="text-xl font-bold font-headline mb-2 text-slate-900">{pkg.title}</h3>
                <p className="text-slate-500 text-sm mb-6 h-12">{pkg.desc}</p>
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <span className="font-headline text-4xl font-black text-primary">{pkg.price}</span>
                  <span className="text-slate-400 font-medium ml-1">{pkg.unit}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {pkg.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-slate-700 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={`w-full py-4 rounded-xl font-bold text-center transition-colors ${pkg.isPopular ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  Chọn Gói Này
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-slate-900 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <UserCircle2 className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-6">
            Yêu cầu tài xế giao tiếp Tiếng Anh?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Chúng tôi có đội ngũ tài xế thông thạo ngoại ngữ, sẵn sàng phục vụ các chuyên gia nước ngoài hoặc đối tác quốc tế của bạn.
          </p>
          <Link href="/contact" className="inline-flex bg-primary text-on-primary px-10 py-4 rounded-full font-headline font-bold tracking-widest hover:brightness-110 transition-all shadow-lg">
            LIÊN HỆ TƯ VẤN THÊM
          </Link>
        </div>
      </section>
    </div>
  );
}
