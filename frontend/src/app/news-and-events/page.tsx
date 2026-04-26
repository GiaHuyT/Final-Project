"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, CalendarDays, ArrowRight, Filter, ChevronDown, Car } from "lucide-react";

export default function NewsAndEventsPage() {
  const pathname = usePathname();

  const newsItems = [
    {
      id: 1,
      title: "RA MẮT SIÊU PHẨM MERCEDES-MAYBACH S680 TRÊN SÀN ĐẤU GIÁ",
      date: "05/01/2026",
      image: "/images/static/news_maybach_auction.png",
      description: "AutoBid tự hào là đơn vị đầu tiên đưa siêu phẩm Mercedes-Maybach S680 V12 với thiết kế độc bản lên sàn đấu giá công khai. Buổi lễ ra mắt thu hút hơn 500 nhà sưu tầm và giới tinh hoa tại Hà Nội.",
    },
    {
      id: 2,
      title: "RA MẮT DỊCH VỤ THẨM ĐỊNH XE CŨ ỨNG DỤNG AI ĐẦU TIÊN TẠI VIỆT NAM",
      date: "25/12/2025",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80",
      description: "Nền tảng AutoBid chính thức nâng cấp hệ thống định giá thông minh, cho phép khách hàng nhận báo giá tham khảo chuẩn xác tới 95% chỉ sau 5 phút cập nhật hình ảnh đa góc độ.",
    },
    {
      id: 3,
      title: "LỄ CÔNG BỐ ĐỐI TÁC CHIẾN LƯỢC CHIẾN LƯỢC TOÀN DIỆN VỚI BMW CHÂU Á",
      date: "15/12/2025",
      image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&q=80",
      description: "Đánh dấu bước ngoặt mới trên thị trường xe sang, AutoBid chính thức trở thành sàn đấu giá ủy quyền cấp cao phân phối xe lướt chính hãng của BMW, đảm bảo nguồn gốc và minh bạch 100%.",
    },
    {
      id: 4,
      title: "CHƯƠNG TRÌNH LÁI THỬ BỘ SƯU TẬP PORSCHE TẠI HA NOI TOWER",
      date: "05/12/2025",
      image: "/images/static/news_porsche_test_drive.png",
      description: "Trải nghiệm cảm giác lái phấn khích từ những cỗ máy tốc độ hàng đầu thế giới: 911 Carrera, Panamera và Macan. Giới hạn 50 suất đăng ký sớm nhất cho hội viên VIP của cộng đồng AutoBid.",
    },
    {
      id: 5,
      title: "GALA NĂM MỚI 2026: ĐÊM HỘI TRI ÂN NHỮNG KHÁCH HÀNG KIM CƯƠNG",
      date: "01/12/2025",
      image: "https://images.unsplash.com/photo-1560179707-f14e90ae4f71?auto=format&fit=crop&q=80",
      description: "Hơn 200 vị khách quý đã tham dự đêm tiệc sang trọng tại Gem Center để tôn vinh sự đồng hành. Tại sự kiện, một chiếc Rolex Daytona bản giới hạn đã được đấu giá từ thiện thành công.",
    },
    {
      id: 6,
      title: "KINH NGHIỆM ĐÁNH GIÁ TÌNH TRẠNG PIN XE ĐIỆN KHI MUA CŨ",
      date: "10/11/2025",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?auto=format&fit=crop&q=80",
      description: "Với xu thế điện hóa, góc nhìn chuyên môn từ các chuyên gia kỹ thuật AutoBid sẽ giúp bạn tự tin hơn khi lựa chọn các dòng EV đã qua sử dụng, đặc biệt là cách đọc thông số SOH của pin.",
    },
    {
      id: 7,
      title: "THỊ TRƯỜNG XE SANG 2025: XU HƯỚNG CÁ NHÂN HÓA LÊN NGÔI",
      date: "25/10/2025",
      image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80",
      description: "Báo cáo phân tích quý 3 của AutoBid chỉ ra rằng khách hàng dường như sẵn sàng chi trả thêm đến 20% cho các mẫu xe sở hữu màu sơn độc quyền hoặc nội thất bọc da Nappa bespoke.",
    },
    {
      id: 8,
      title: "KHAI TRƯƠNG SHOWROOM SỐ X AUTOBID TẠI QUẬN 7, TP.HCM",
      date: "15/09/2025",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80",
      description: "Chào đón không gian trưng bày xe lướt lớn nhất miền Nam. Khách hàng giờ đây có thể ngắm nhìn trực tiếp các siêu phẩm trước khi tham gia đấu giá kỹ thuật số.",
    }
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-24">
      
      {/* Sub-Navigation (Like Mazda) */}
      <div className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-center uppercase tracking-widest text-xs font-bold">
          <Link 
            href="/news-and-events"
            className={`py-5 px-10 transition-colors border-b-2 ${pathname === '/news-and-events' ? 'border-primary text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            Xe & Sự Kiện
          </Link>
          <Link 
            href="/offers"
            className={`py-5 px-10 transition-colors border-b-2 ${pathname === '/offers' ? 'border-primary text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            Tin Tức & Ưu Đãi
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <section className="bg-white py-12 text-center text-slate-900 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-widest uppercase mb-4">
            XE & SỰ KIỆN
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 bg-surface min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            
            <div className="flex gap-12 w-full md:w-auto uppercase font-bold text-xs tracking-widest">
                <span className="text-slate-900 border-b border-slate-900 pb-1">THƯƠNG HIỆU</span>
                <span className="text-slate-900 border-b border-slate-900 pb-1">CHỦ ĐỀ</span>
            </div>

            {/* Filters Dropdown (Visual Only) */}
            <div className="flex gap-4 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative flex-1 md:w-48 group border-b border-slate-300">
                <select className="w-full appearance-none bg-transparent text-slate-700 text-sm font-semibold pl-2 pr-10 py-3 focus:outline-none cursor-pointer">
                  <option value="all">ALL TIER</option>
                  <option value="luxury">Luxury</option>
                  <option value="sport">Sport</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-900">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative flex-1 md:w-48 group border-b border-slate-300">
                <select className="w-full appearance-none bg-transparent text-slate-700 text-sm font-semibold pl-2 pr-10 py-3 focus:outline-none cursor-pointer">
                  <option value="all">SỰ KIỆN</option>
                  <option value="hcm">RA MẮT XE</option>
                  <option value="hn">TIN THỊ TRƯỜNG</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-900">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Link href={`/news-and-events/${item.id}`} key={item.id} className="bg-white overflow-hidden group flex flex-col cursor-pointer border border-transparent hover:border-slate-200 transition-colors shadow-sm">
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1 bg-slate-50 group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-3 font-label tracking-wider">
                    <CalendarDays className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-headline text-[1.15rem] font-bold text-slate-900 leading-snug mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-auto pt-5">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                      CHI TIẾT
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Subscribe Section */}
      <section className="bg-slate-900 py-20 relative overflow-hidden text-center text-white px-6">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Đăng ký nhận thông tin</h2>
          <p className="text-slate-400 mb-8 text-sm md:text-base">Mọi sự kiện ra mắt và xu hướng xe lướt siêu sang sẽ được gửi tới hòm thư của bạn mỗi tuần.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Địa chỉ email của bạn..." 
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:bg-slate-800 transition-all font-body text-sm"
            />
            <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:brightness-110 transition-all flex items-center justify-center">
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
