"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Wrench, CircleDollarSign, Smile, ArrowRight, 
  CalendarClock, PenTool, CheckCircle2, AlertTriangle, 
  Car, Settings, Thermometer, Battery, ChevronDown, ChevronUp
} from "lucide-react";

export default function MaintenancePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const benefits = [
    {
      title: "Duy trì khả năng vận hành",
      description: "Ở điều kiện khí hậu nhiệt đới, xe dễ bị ăn mòn và hao mòn tự nhiên. Bảo dưỡng định kỳ giúp làm chậm quá trình này, duy trì trạng thái vận hành tối ưu nhất cho cỗ máy của bạn.",
      icon: <Wrench className="w-8 h-8 text-primary" />,
      color: "bg-blue-50/50 dark:bg-blue-900/20",
    },
    {
      title: "Đảm bảo an toàn tối đa",
      description: "Phát hiện sớm các rủi ro sụt giảm hiệu suất phanh, độ bám đường hay bình ắc quy yếu, ngăn chặn kịp thời những hiện tượng gây mất an toàn tiềm ẩn trên hành trình.",
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      color: "bg-emerald-50/50 dark:bg-emerald-900/20",
    },
    {
      title: "Tiết kiệm chi phí sửa chữa",
      description: "Thường xuyên kiểm tra giúp bạn tránh phải trả những khoản phí sửa chữa khổng lồ sau này. Phát hiện những hỏng hóc nhỏ từ sớm giúp tối ưu nguồn tài chính.",
      icon: <CircleDollarSign className="w-8 h-8 text-primary" />,
      color: "bg-amber-50/50 dark:bg-amber-900/20",
    },
    {
      title: "Trải nghiệm cầm lái thư thái",
      description: "Tận hưởng cảm giác vần vô-lăng đầy tự tin, an tâm khi xe đã được chăm sóc kỹ lưỡng bởi chuyên gia am hiểu. Hành trình hoàn hảo không chút âu lo.",
      icon: <Smile className="w-8 h-8 text-primary" />,
      color: "bg-purple-50/50 dark:bg-purple-900/20",
    }
  ];

  const maintenanceSchedule = [
    { cap: "Cấp 1 (Nhỏ)", kms: "5.000 / 15.000 / 25.000 km", items: ["Thay nhớt động cơ", "Kiểm tra lọc gió", "Kiểm tra áp suất lốp", "Kiểm tra hệ thống đèn chiếu sáng", "Bổ sung nước làm mát, nước rửa kính"] },
    { cap: "Cấp 2 (Trung bình)", kms: "10.000 / 30.000 / 50.000 km", items: ["Thay lọc nhớt", "Bảo dưỡng hệ thống phanh 4 bánh", "Kiểm tra thước lái", "Đảo lốp", "Vệ sinh kim phun buồng đốt"] },
    { cap: "Cấp 3 (Trung lớn)", kms: "20.000 / 60.000 / 100.000 km", items: ["Thay lọc xăng/dầu", "Thay bugi", "Cân bằng động và chỉnh góc đặt bánh xe", "Vệ sinh bướm ga", "Thay dầu phanh"] },
    { cap: "Cấp 4 (Lớn)", kms: "40.000 / 80.000 / 120.000 km", items: ["Thay dầu hộp số", "Thay nước làm mát động cơ", "Bảo dưỡng toàn diện hệ thống treo", "Thay dây curoa tổng", "Súc rửa két nước làm mát"] }
  ];

  const warningSigns = [
    { title: "Đèn cảnh báo Check Engine sáng", desc: "Đây là dấu hiệu rõ ràng nhất cho thấy động cơ hoặc hệ thống liên quan đang gặp sự cố. Đừng phớt lờ đèn báo này.", icon: <AlertTriangle className="w-6 h-6 text-red-500" /> },
    { title: "Âm thanh lạ khi vận hành", desc: "Tiếng rít từ phanh, tiếng lạch cạch dưới gầm xe hay tiếng gầm rú bất thường từ động cơ đều báo hiệu hư hỏng cần kiểm tra.", icon: <Settings className="w-6 h-6 text-orange-500" /> },
    { title: "Rò rỉ nhiên liệu, chất lỏng", desc: "Vết dầu nhớt, nước làm mát hay dầu phanh đọng dưới gầm xe là tình trạng khẩn cấp có thể gây hỏng hóc nặng hoặc nguy hiểm.", icon: <Thermometer className="w-6 h-6 text-red-500" /> },
    { title: "Xe khởi động chậm, khó nổ", desc: "Dấu hiệu rõ rệt của bình ắc quy sắp hết tuổi thọ hoặc hệ thống đánh lửa (bugi) đang có vấn đề.", icon: <Battery className="w-6 h-6 text-yellow-500" /> }
  ];

  const faqs = [
    {
      question: "Tôi có thể bỏ qua các đợt bảo dưỡng nhỏ và chỉ làm đợt lớn được không?",
      answer: "Không nên. Các đợt bảo dưỡng nhỏ (như thay nhớt ở 5,000km) là rất quan trọng để duy trì độ trơn tru của màng dầu trong động cơ. Việc bỏ qua có thể dẫn tới tắc nghẽn, tạo cặn bám, làm hỏng động cơ về lâu dài và tốn kém hơn nhiều."
    },
    {
      question: "Phụ tùng thay thế có phải là chính hãng không?",
      answer: "AutoBid cam kết 100% phụ tùng thay thế, dầu nhớt và vật tư tiêu hao đều được nhập khẩu chính hãng trực tiếp từ các nhà sản xuất xe sang, đảm bảo tính đồng bộ và duy trì hiệu suất y như xe xuất xưởng."
    },
    {
      question: "Bảo dưỡng định kỳ mất khoảng bao lâu?",
      answer: "Tùy thuộc vào cấp độ bảo dưỡng. Thông thường, Cấp 1 (Nhỏ) chỉ mất khoảng 45 - 60 phút. Các cấp độ lớn hơn có thể từ 2 đến 4 tiếng. Chúng tôi khuyên bạn nên 'Đặt lịch hẹn' trước để tiết kiệm thời gian chờ đợi."
    },
    {
      question: "Xe ít đi có cần tuân thủ bảo dưỡng định kỳ?",
      answer: "Dù xe ít sử dụng, các loại dung dịch như dầu máy, dầu phanh, nước làm mát và lốp xe vẫn bị lão hóa theo thời gian. Các hãng xe luôn có mốc thời gian phụ (ví dụ 6 tháng hoặc 5,000km, tùy điều kiện nào đến trước). Do đó, bạn vẫn cần đưa xe đến trung tâm để kiểm tra định kỳ."
    }
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            alt="Đội ngũ kỹ thuật bảo dưỡng siêu xe"
            className="w-full h-full object-cover opacity-60"
            src="https://images.unsplash.com/photo-1632823469850-d4cfd4de9292?auto=format&fit=crop&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-3xl">
            <span className="text-primary font-label text-sm uppercase tracking-[0.3em] font-bold mb-4 block">Dịch vụ sau bán hàng chuyên nghiệp</span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-[1.1]">
              BẢO DƯỠNG TRỌN VẸN. <br /> HIỆU SUẤT ĐỈNH CAO.
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-10 font-body leading-relaxed max-w-xl">
              Dịch vụ bảo dưỡng chuẩn hãng với những quy chuẩn khắt khe nhất dành riêng cho các cỗ máy đắt giá. Kiểm tra, bảo dưỡng xe, thay thế phụ tùng theo đúng lịch trình nhằm đảm bảo xế cưng của bạn luôn trong trạng thái hoàn hảo nhất.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                ĐẶT HẸN NGAY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Maintenance is important Section */}
      <section className="py-24 bg-surface-container-low relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-label text-sm uppercase tracking-[0.2em] font-bold mb-2 block">Giá Trị Cốt Lõi</span>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900">
              Tại sao không thể bỏ qua bảo dưỡng định kỳ?
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Việc tuân thủ bảo dưỡng định kỳ mang tới cho người dùng những giá trị không chỉ về mặt vật chất mà còn là sự an tâm tuyệt đối khi làm chủ vô lăng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${benefit.color}`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-slate-900">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed grow">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Signs Section - New Addition */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/3">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6">
                Những dấu hiệu gọi tên trung tâm dịch vụ
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Ngoài lịch trình bảo dưỡng định kỳ dựa trên quãng đường hoặc thời gian, chiếc xe của bạn luôn chủ động cảnh báo khi có sự cố. Hãy lưu tâm đến những dấu hiệu dù là nhỏ nhất.
              </p>
              <button className="text-primary font-bold tracking-widest text-sm flex items-center gap-2 group border-b border-primary pb-1 w-max">
                GỌI CỨU HỘ KHẨN CẤP
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {warningSigns.map((sign, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    {sign.icon}
                  </div>
                  <h3 className="text-lg font-bold font-headline mb-2">{sign.title}</h3>
                  <p className="text-slate-400 text-sm">{sign.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Details Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 w-full order-2 lg:order-1">
            <span className="text-primary font-label text-sm uppercase tracking-widest font-bold mb-3 block">Bảo mật vận hành</span>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
              Chi tiết lịch bảo dưỡng
            </h2>
            <p className="text-slate-600 mb-10 text-lg">
              Giữ cho nội tạng của cỗ máy luôn khỏa mạnh bằng việc tuân thủ mốc kiểm tra. Lịch bên dưới mang tính tham khảo phổ thông, để chính xác nhất hãy theo dõi sổ tay kỹ thuật của nhà sản xuất.
            </p>

            <div className="space-y-4">
              {maintenanceSchedule.map((schedule, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col hover:border-primary/50 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-200/50 pb-4">
                    <h3 className="font-bold text-xl text-slate-900">{schedule.cap}</h3>
                    <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm mt-2 sm:mt-0 table">
                      Mốc: {schedule.kms}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {schedule.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-slate-600 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl flex gap-4 items-start border border-blue-100">
              <Car className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Mẹo nhỏ mùa mưa</h4>
                <p className="text-sm text-blue-800">Cần gạt mưa, hệ thống đèn chiếu sáng và đặc biệt là độ sâu rãnh lốp nên được kiểm tra thường xuyên trong mùa mưa bão để đảm bảo tầm nhìn cũng như độ bám đường tối đa.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="sticky top-24 relative rounded-3xl overflow-hidden shadow-2xl h-[800px]">
              <img 
                src="/images/static/luxury_car_maintenance.png" 
                alt="Kiểm tra khoang động cơ" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-10">
                <blockquote className="text-white font-body text-2xl italic font-medium leading-relaxed border-l-4 border-primary pl-6">
                  "Sự hoàn hảo không thể được đánh đổi. Một cỗ máy tinh hoa cần một quy trình bảo dưỡng không có điểm tựa cho sai số."
                </blockquote>
                <p className="text-white/60 font-bold uppercase tracking-widest mt-4 pl-6 text-sm">Giám đốc dịch vụ AutoBid</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900">
              Câu hỏi thường gặp
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Giải đáp những thắc mắc phổ biến nhất của khách hàng về dịch vụ bảo dưỡng và sửa chữa tại hệ thống.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
                <button 
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-slate-900 text-lg pr-8">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="font-headline text-2xl font-bold mb-4">AutoBid Services</div>
          <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">Đảm bảo dòng xe của bạn luôn giữ được sức mạnh nguyên bản. Liên hệ ngay với chúng tôi để được tư vấn thêm về gói bảo dưỡng phù hợp.</p>
          <p className="font-body text-[10px] uppercase tracking-widest font-medium text-slate-400">© 2024 AutoBid Aftersales. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
