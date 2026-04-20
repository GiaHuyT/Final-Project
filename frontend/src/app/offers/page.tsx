"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, CalendarDays, ArrowRight, Filter, ChevronDown, Car } from "lucide-react";

export default function OffersPage() {
  const pathname = usePathname();

  const offerItems = [
    {
      id: 1,
      title: "ƯU ĐÃI ĐẶC QUYỀN THÁNG 1: CHÀO ĐÓN NĂM MỚI TÀI LỘC",
      date: "01/01/2026",
      image: "/images/static/offer_new_year.png",
      description: "AutoBid mang đến chương trình tri ân lớn nhất năm. Tặng liền tay gói bảo hiểm vật chất cao cấp 2 năm và voucher bảo dưỡng trị giá lên đến 50 triệu đồng khi đấu giá thành công các dòng Mercedes-Benz và BMW trong tháng 1.",
    },
    {
      id: 2,
      title: "CHÀO ĐÓN GIÁNG SINH & NĂM MỚI – AUTOBID ƯU ĐÃI LỚN NHẤT NĂM",
      date: "10/12/2025",
      image: "https://images.unsplash.com/photo-1512413913426-3023e9c1db16?auto=format&fit=crop&q=80",
      description: "Hòa chung không khí lễ hội cuối năm, AutoBid áp dụng mức giảm phí dịch vụ nền tảng lên đến 50% cho tất cả các giao dịch. Đồng thời tặng kèm gói phủ Ceramic cao cấp trị giá 25 triệu cho 100 khách hàng chốt xe đầu tiên.",
    },
    {
      id: 3,
      title: "ĐẠI TIỆC MUA SẮM BLACK FRIDAY: MIỄN PHÍ THẨM ĐỊNH XE LƯỚT",
      date: "20/11/2025",
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80",
      description: "Chỉ duy nhất trong tuần lễ Black Friday, mọi yêu cầu ký gửi và thẩm định xe sang tại trung tâm AutoBid đều được miễn phí 100%. Áp dụng toàn quốc cho các dòng xe sản xuất từ năm 2020 trở lên.",
    },
    {
      id: 4,
      title: "GÓI BẢO DƯỠNG MÙA MƯA: AN TOÀN TRÊN MỌI CUNG ĐƯỜNG",
      date: "20/10/2025",
      image: "/images/static/offer_maintenance.png",
      description: "Chuẩn bị cho những chuyến đi an toàn trong điều kiện thời tiết xấu. Miễn phí kiểm tra 24 hạng mục khung gầm, hệ thống điện và giảm 30% chi phí thay màng gạt mưa chính hãng, tặng dung dịch phủ nano kính chắn gió.",
    },
    {
      id: 5,
      title: "CHƯƠNG TRÌNH THU CŨ ĐỔI MỚI - LÊN ĐỜI XE SANG DỄ DÀNG",
      date: "05/09/2025",
      image: "https://images.unsplash.com/photo-1550524514-ceb609db2465?auto=format&fit=crop&q=80",
      description: "Chương trình hỗ trợ thu mua xe sang cũ với giá cao hơn thị trường 5%, đồng thời trợ giá trực tiếp thêm lên đến 100 triệu đồng khi quý khách tham gia đấu giá sở hữu xe mới tại nền tảng AutoBid.",
    },
    {
      id: 6,
      title: "THÁNG 8 TUNG ƯU ĐÃI: TẶNG 1 NĂM SẠC ĐIỆN MIỄN PHÍ TẠI NHÀ",
      date: "12/08/2025",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?auto=format&fit=crop&q=80",
      description: "Nhằm thúc đẩy xu hướng xe xanh, khách hàng trúng đấu giá các dòng xe thuần điện (EV) như Porsche Taycan, Audi e-tron sẽ nhận ngay đặc quyền 1 năm sạc điện miễn phí và lắp đặt Wallbox chuẩn Châu Âu trọn gói.",
    },
    {
      id: 7,
      title: "SIÊU ƯU ĐÃI ĐẶC QUYỀN VIP CHO THÀNH VIÊN PLATINUM",
      date: "01/07/2025",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80",
      description: "Dưới sự hợp tác cùng các ngân hàng đối tác, thành viên Platinum của AutoBid sẽ được hưởng lãi suất vay mua xe chỉ 4.9%/năm cố định trong 2 năm đầu tiên. Đặc quyền phê duyệt nhanh trong 4 giờ.",
    },
    {
      id: 8,
      title: "CHÀO HÈ SÔI ĐỘNG CÙNG SUV THỂ THAO: TẶNG CHUYẾN NGHỈ DƯỠNG 5 SAO",
      date: "15/05/2025",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80",
      description: "Khách hàng chốt thành công các dòng SUV thể thao siêu sang (G-Class, Cayenne, Urus) sẽ nhận voucher nghỉ dưỡng Resort 5 sao danh tiếng tại Phú Quốc dành cho gia đình trị giá 80 triệu đồng.",
    }
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-16">
      
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
            TIN TỨC & ƯU ĐÃI
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 bg-surface min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            
            <div className="flex gap-12 w-full md:w-auto uppercase font-bold text-xs tracking-widest">
                <span className="text-slate-900 border-b border-slate-900 pb-1">CHỌN XE</span>
                <span className="text-slate-900 border-b border-slate-900 pb-1">CHỌN KHU VỰC</span>
            </div>

            {/* Filters Dropdown (Visual Only) */}
            <div className="flex gap-4 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative flex-1 md:w-48 group border-b border-slate-300">
                <select className="w-full appearance-none bg-transparent text-slate-700 text-sm font-semibold pl-2 pr-10 py-3 focus:outline-none cursor-pointer">
                  <option value="all">ALL</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="bmw">BMW</option>
                  <option value="porsche">Porsche</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-900">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative flex-1 md:w-48 group border-b border-slate-300">
                <select className="w-full appearance-none bg-transparent text-slate-700 text-sm font-semibold pl-2 pr-10 py-3 focus:outline-none cursor-pointer">
                  <option value="all">ALL</option>
                  <option value="hcm">Hồ Chí Minh</option>
                  <option value="hn">Hà Nội</option>
                  <option value="dn">Đà Nẵng</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-900">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerItems.map((item) => (
              <Link href={`/offers/${item.id}`} key={item.id} className="bg-white overflow-hidden group flex flex-col cursor-pointer border border-transparent hover:border-slate-200 transition-colors shadow-sm">
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
